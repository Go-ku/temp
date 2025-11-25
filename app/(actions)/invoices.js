"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Lease from "@/models/Lease";
import { revalidatePath } from "next/cache";
import { sendRentReminderWhatsApp } from "@/lib/notifications/whatsappRentReminder";

export async function updateInvoiceFromPayments(invoiceId) {
  await connectToDatabase();

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return { success: false, errors: { _form: "Invoice not found" } };

  const payments = await Payment.find({ invoice: invoice._id, status: "successful" });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  invoice.amountPaid = totalPaid;

  if (totalPaid <= 0) {
    invoice.status = new Date() > invoice.dueDate ? "overdue" : "pending";
  } else if (totalPaid < invoice.amountDue) {
    invoice.status = new Date() > invoice.dueDate ? "overdue" : "partially_paid";
  } else {
    invoice.status = "paid";
  }

  await invoice.save();
  return { success: true, data: invoice };
}

export async function createInitialInvoice(leaseId) {
  await connectToDatabase();

  const lease = await Lease.findById(leaseId)
    .populate("tenant")
    .populate("property")
    .lean();

  if (!lease) {
    throw new Error("Lease not found");
  }

  const now = new Date();
  const start = new Date(lease.startDate);

  const sameMonth =
    now.getFullYear() === start.getFullYear() &&
    now.getMonth() === start.getMonth();

  const futureStart = start > now;

  const year = start.getFullYear();
  const month = start.getMonth();
  const periodLabel = `${year}-${String(month + 1).padStart(2, "0")}`;

  // Prevent duplicate invoice for period
  const existing = await Invoice.findOne({
    lease: lease._id,
    periodLabel,
  });

  if (existing) return existing;

  // CASE B: Lease starts in a future month → no initial invoice
  if (futureStart && !sameMonth) {
    return null;
  }

  // Determine days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Prorated days
  const moveInDay = start.getDate();
  const proratedDays = daysInMonth - moveInDay + 1;

  // CASE A & C: This month (or earlier this month) → prorated invoice
  let amountDue = lease.rentAmount;

  if (sameMonth && moveInDay > 1) {
    const dailyRate = lease.rentAmount / daysInMonth;
    amountDue = Math.round(dailyRate * proratedDays);
  }

  // Due date = next dueDay OR today if overdue
  let dueDate = new Date(year, month, lease.dueDay);
  if (dueDate < start) {
    dueDate = start; // move-in invoice due immediately
  }

  const reference = `INV-${lease._id.toString().slice(-6)}-${periodLabel}`;

  const invoice = await Invoice.create({
    lease: lease._id,
    tenant: lease.tenant._id,
    property: lease.property._id,

    amountDue,
    currency: lease.rentCurrency || "ZMW",
    amountPaid: 0,
    status: "pending",

    periodLabel,
    issueDate: now,
    dueDate,
    reference,
  });

  await sendRentReminderWhatsApp({
  tenant: lease.tenant,
  invoice,
  property: lease.property,
  type: "new",
});

  // Revalidate relevant pages
  revalidatePath("/invoices");
  revalidatePath(`/properties/${lease.property._id}`);
  revalidatePath(`/leases/${lease._id}`);
  revalidatePath(`/dashboard/landlord`);

  return invoice;
}
