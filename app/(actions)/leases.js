"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import Lease from "@/models/Lease";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import { revalidatePath } from "next/cache";
import { createInitialInvoice } from "@/app/(actions)/invoices";
import { sendRentReminderWhatsApp } from "@/lib/notifications/whatsappRentReminder";
import { Resend } from "resend";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { onboardTenant } from "./tenantOnboard";

async function generateLeaseRef() {
  // Keep trying until we find an unused ref
  let attempt = 0;
  while (attempt < 5) {
    const ref = `LEASE-${Math.random().toString(36).slice(-6).toUpperCase()}`;
    // Use exists to avoid fetching full doc
    const exists = await Lease.exists({ leaseRef: ref });
    if (!exists) return ref;
    attempt += 1;
  }
  // Fallback to ObjectId-based ref if random collisions somehow happen
  const fallback = `LEASE-${new Date().getTime().toString(36).toUpperCase()}`;
  return fallback;
}

export async function createLease(data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    // Ensure a unique leaseRef to avoid duplicate key errors
    data.leaseRef = data?.leaseRef || (await generateLeaseRef());

    // Landlords (and admins) should create active leases; tenants create pending
    const isLandlord =
      session.user.roles?.includes("landlord") ||
      session.user.roles?.includes("admin");
    data.status = data.status || (isLandlord ? "active" : "pending");

    const lease = await Lease.create(data);
    if (data?.tenant) {
      await onboardTenant(data.tenant);
    }

    // Mark property as occupied when a landlord creates the lease
    if (isLandlord && data?.property) {
      await Property.findByIdAndUpdate(data.property, { isOccupied: true });
    }

    await createInitialInvoice(lease._id);
    revalidatePath("/leases");
    const safeLease = JSON.parse(JSON.stringify(lease));
    return { success: true, data: safeLease };
  } catch (err) {
    if (err?.code === 11000) {
      return {
        success: false,
        errors:
          "A lease reference already exists. Please try again or contact support.",
      };
    }
    return { success: false, errors: err.errors || err.message };
  }
}

export async function getLease(id) {
  await connectToDatabase();
  const lease = await Lease.findById(id)
    .populate("property")
    .populate("tenant")
    .populate("landlord");

  return { success: !!lease, data: lease };
}

export async function updateLease(id, data) {
    const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    const updated = await Lease.findByIdAndUpdate(id, data, { new: true });
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function deleteLease(id) {
    const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  await Lease.findByIdAndDelete(id);
  return { success: true };
}

export async function listLeases(query = {}) {
  await connectToDatabase();
  const leases = await Lease.find(query)
    .populate("property")
    .populate("tenant")
    .populate("landlord")
    .sort({ createdAt: -1 });
  return { success: true, data: leases };
}

//Inccrese Rent Action


export async function increaseLeaseRent(leaseId, formData) {
  await connectToDatabase();

  const lease = await Lease.findById(leaseId)
    .populate("tenant")
    .populate("property");

  if (!lease) return { success: false, error: "Lease not found." };

  const type = formData.get("type"); // percent or fixed
  const amount = Number(formData.get("amount"));

  let newAmount = lease.rentAmount;

  if (type === "percent") {
    newAmount = Math.round(lease.rentAmount * (1 + amount / 100));
  } else {
    newAmount = amount;
  }

  lease.lastRentIncreaseDate = new Date();
  lease.rentAmount = newAmount;
  await lease.save();

  // Optional: generate an invoice with the new rent
  await createInitialInvoice(lease._id);

  // Notify tenant via WhatsApp
  await sendRentReminderWhatsApp({
    tenant: lease.tenant,
    invoice: { periodLabel: "Next Month", amountDue: newAmount },
    property: lease.property,
    type: "new",
  });

  // Notify via Email
  if (lease.tenant.email) {
    await Resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: lease.tenant.email,
      subject: "Rent Increase Notice",
      html: `
        <p>Dear ${lease.tenant.fullName},</p>
        <p>Your rent for ${lease.property.title} has been updated.</p>
        <p><strong>New Monthly Rent:</strong> ZMW ${newAmount.toLocaleString()}</p>
        <p>This change takes effect next billing cycle.</p>
      `,
    });
  }

  revalidatePath(`/leases/${leaseId}`);
  revalidatePath(`/properties/${lease.property._id}`);
  revalidatePath(`/dashboard/landlord`);

  return { success: true };
}

// ------------------------------
// TERMINATE LEASE
// ------------------------------
export async function terminateLease(leaseId, formData) {
  await connectToDatabase();

  const lease = await Lease.findById(leaseId)
    .populate("tenant")
    .populate("property");

  if (!lease) return { success: false, error: "Lease not found." };

  const terminationDate = new Date(formData.get("terminationDate"));
  const reason = formData.get("reason");

  lease.status = "terminated";
  lease.terminationDate = terminationDate;
  lease.terminationReason = reason;
  await lease.save();

  // Notify tenant via WhatsApp
  await sendRentReminderWhatsApp({
    tenant: lease.tenant,
    invoice: lease,
    property: lease.property,
    type: "overdue", // or custom message
  });

  // Email notice
  if (lease.tenant.email) {
    await Resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: lease.tenant.email,
      subject: "Lease Termination Notice",
      html: `
        <p>Dear ${lease.tenant.fullName},</p>
        <p>Your lease for <strong>${lease.property.title}</strong> has been terminated.</p>
        <p><strong>Termination Date:</strong> ${terminationDate.toDateString()}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      `,
    });
  }

  revalidatePath(`/leases/${leaseId}`);
  revalidatePath(`/properties/${lease.property._id}`);
  revalidatePath(`/dashboard/landlord`);

  return { success: true };
}

export async function renewLease(leaseId, formData) {
  await connectToDatabase();

  const lease = await Lease.findById(leaseId)
    .populate("tenant")
    .populate("property")
    .populate("landlord");

  if (!lease) return { success: false, error: "Lease not found" };

  const renewalType = formData.get("renewalType"); // extend or new
  const newRent = Number(formData.get("rentAmount"));
  const newStart = new Date(formData.get("startDate"));
  const newEnd = formData.get("endDate")
    ? new Date(formData.get("endDate"))
    : null;

  // -------------------------
  // OPTION A — EXTEND CURRENT LEASE
  // -------------------------
  if (renewalType === "extend") {
    lease.startDate = newStart;
    lease.endDate = newEnd;
    lease.rentAmount = newRent;

    lease.status = "active";
    lease.lastRentIncreaseDate = new Date();

    await lease.save();

    await createInitialInvoice(lease._id);

    // --- notifications ---
    await sendWhatsAppMessage(
      lease.tenant.phone,
      `Your lease for ${lease.property.title} has been renewed.\n\n` +
      `New Rent: ZMW ${newRent.toLocaleString()}\n` +
      `Start: ${newStart.toDateString()}\n` +
      (newEnd ? `End: ${newEnd.toDateString()}\n` : `No end date.\n`) +
      `Your next invoice will reflect the updated rent.`
    );

    if (lease.tenant.email) {
      await Resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: lease.tenant.email,
        subject: "Lease Renewal Confirmation",
        html: `
          <p>Dear ${lease.tenant.fullName},</p>
          <p>Your lease for <strong>${lease.property.title}</strong> has been renewed.</p>
          <p><strong>New Rent:</strong> ZMW ${newRent.toLocaleString()}</p>
          <p><strong>Start:</strong> ${newStart.toDateString()}</p>
          <p><strong>End:</strong> ${newEnd ? newEnd.toDateString() : "Open-ended"}</p>
          <p>Your next invoice will reflect the updated rent.</p>
        `,
      });
    }

    revalidatePath(`/leases/${lease._id}`);
    revalidatePath(`/dashboard/landlord`);

    return { success: true, leaseId: lease._id };
  }

  // -------------------------
  // OPTION B — CREATE NEW LEASE
  // -------------------------

  const newLease = await Lease.create({
    property: lease.property._id,
    tenant: lease.tenant._id,
    landlord: lease.landlord._id,
    startDate: newStart,
    endDate: newEnd,
    rentAmount: newRent,
    rentCurrency: lease.rentCurrency,
    rentFrequency: lease.rentFrequency,
    dueDay: lease.dueDay,
    depositAmount: lease.depositAmount,
    depositHeld: lease.depositHeld,
    status: "active",
    lastRentIncreaseDate: new Date(),
  });

  // Archive old lease
  lease.status = "expired";
  await lease.save();

  // Create initial invoice for new lease
  await createInitialInvoice(newLease._id);

  await sendWhatsAppMessage(
    lease.tenant.phone,
    `Your lease for ${lease.property.title} has been renewed.\n\n` +
    `New Rent: ZMW ${newRent.toLocaleString()}\n` +
    `New Lease Start: ${newStart.toDateString()}\n`
  );

  if (lease.tenant.email) {
    await Resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: lease.tenant.email,
      subject: "New Lease Agreement Created",
      html: `
        <p>Dear ${lease.tenant.fullName},</p>
        <p>Your lease for <strong>${lease.property.title}</strong> has been renewed and a new lease agreement has been created.</p>
        <p><strong>New Rent:</strong> ZMW ${newRent.toLocaleString()}</p>
        <p><strong>Start:</strong> ${newStart.toDateString()}</p>
        <p><strong>End:</strong> ${newEnd ? newEnd.toDateString() : "Open-ended"}</p>
      `,
    });
  }

  revalidatePath(`/leases/${newLease._id}`);
  revalidatePath(`/properties/${lease.property._id}`);
  revalidatePath(`/dashboard/landlord`);

  return { success: true, leaseId: newLease._id };
}
