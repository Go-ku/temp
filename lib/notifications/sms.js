import twilio from "twilio";
import Payment from "@/models/Payment";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import { connectToDatabase } from "@/lib/db/mongoose";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendPaymentReceiptSms(paymentId) {
  await connectToDatabase();

  const payment = await Payment.findById(paymentId)
    .populate("tenant")
    .populate("property")
    .lean();

  if (!payment || !payment.tenant?.phone) return;

  const msg = `Payment received: ZMW ${payment.amount.toLocaleString()} for ${payment.property.title}. Receipt: ${payment.receiptNumber}. Thank you.`;

  await client.messages.create({
    body: msg,
    from: process.env.TWILIO_FROM_NUMBER,
    to: payment.tenant.phone, // must be +260 format
  });
}
