"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import Lease from "@/models/Lease";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { generateDepositRefundPdf } from "@/lib/pdf/generateDepositRefundPdf";

const resend = new Resend(process.env.RESEND_API_KEY);

// -----------------------------------------
// DEDUCT FROM DEPOSIT
// -----------------------------------------
export async function deductDeposit(leaseId, formData) {
  await connectToDatabase();

  const amount = Number(formData.get("amount"));
  const reason = formData.get("reason");

  const lease = await Lease.findById(leaseId)
    .populate("tenant")
    .populate("property");

  if (!lease) return { success: false, error: "Lease not found" };

  if (amount > lease.depositBalance) {
    return { success: false, error: "Cannot deduct more than balance" };
  }

  lease.depositBalance -= amount;
  lease.depositHistory.push({
    type: "deduction",
    amount,
    reason,
  });

  await lease.save();

  // Notify landlord (optional)
  // Notify tenant via WhatsApp
  await sendWhatsAppMessage(
    lease.tenant.phone,
    `A deposit deduction has been made for ${lease.property.title}\n\nAmount: ZMW ${amount}\nReason: ${reason}`
  );

  return { success: true };
}

// -----------------------------------------
// REFUND DEPOSIT
// -----------------------------------------
export async function refundDeposit(leaseId, formData) {
  await connectToDatabase();

  const amount = Number(formData.get("amount"));
  const reason = formData.get("reason");

  const lease = await Lease.findById(leaseId)
    .populate("tenant")
    .populate("property");

  if (!lease) return { success: false, error: "Lease not found" };

  if (amount > lease.depositBalance) {
    return { success: false, error: "Refund exceeds deposit balance" };
  }

  lease.depositBalance -= amount;
  lease.depositHistory.push({
    type: "refund",
    amount,
    reason,
  });

  await lease.save();

  // Generate refund PDF
  const pdfUrl = await generateDepositRefundPdf(lease, amount, reason);

  // Email tenant
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: lease.tenant.email,
    subject: "Deposit Refund Confirmation",
    html: `
      <p>Dear ${lease.tenant.fullName},</p>
      <p>Your deposit refund has been processed.</p>
      <p><strong>Amount Refunded:</strong> ZMW ${amount}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}${pdfUrl}">Download Refund Receipt</a></p>
    `,
  });

  // WhatsApp message
  await sendWhatsAppMessage(
    lease.tenant.phone,
    `Deposit Refund Processed\n\nProperty: ${lease.property.title}\nAmount: ZMW ${amount}\nReason: ${reason}`
  );

  revalidatePath(`/leases/${leaseId}`);

  return { success: true };
}
