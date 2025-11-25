import { Resend } from "resend";
import Payment from "@/models/Payment";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import Invoice from "@/models/Invoice";
import { connectToDatabase } from "@/lib/db/mongoose";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentReceiptEmail(paymentId) {
  await connectToDatabase();

  const payment = await Payment.findById(paymentId)
    .populate("tenant")
    .populate("property")
    .populate("invoice")
    .lean();

  if (!payment) return;

  const filePath = path.join(
    process.cwd(),
    "public",
    "receipts",
    `receipt-${payment.receiptNumber}.pdf`
  );

  const pdfFile = fs.readFileSync(filePath);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: payment.tenant.email,
    subject: `Payment Receipt — ${payment.receiptNumber}`,
    text: `
Dear ${payment.tenant.fullName},

We have received your payment of ZMW ${payment.amount.toLocaleString()}.

Receipt Number: ${payment.receiptNumber}
Property: ${payment.property.title}
Date: ${new Date(payment.datePaid).toDateString()}

Thank you for your timely payment.

Nyumba Real Estate
`,
    attachments: [
      {
        filename: `receipt-${payment.receiptNumber}.pdf`,
        content: pdfFile,
      },
    ],
  });
}
