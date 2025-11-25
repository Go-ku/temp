import { pdf } from "@react-pdf/renderer";
import ReceiptPdf from "@/components/pdf/ReceiptPdf";
import Payment from "@/models/Payment";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import Invoice from "@/models/Invoice";
import { connectToDatabase } from "@/lib/db/mongoose";
import fs from "fs";
import path from "path";

export async function generateReceiptForPayment(paymentId) {
  await connectToDatabase();

  const payment = await Payment.findById(paymentId)
    .populate("tenant")
    .populate("property")
    .populate("invoice")
    .lean();

  if (!payment) return null;

  const doc = <ReceiptPdf payment={payment} />;
  const buffer = await pdf(doc).toBuffer();

  // Option A (recommended): Save file locally
  const receiptsDir = path.join(process.cwd(), "public", "receipts");
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const filename = `receipt-${payment.receiptNumber}.pdf`;
  const filePath = path.join(receiptsDir, filename);

  fs.writeFileSync(filePath, buffer);

  // Save URL in the DB (so you can link directly from dashboard)
  const receiptUrl = `/receipts/${filename}`;

  await Payment.findByIdAndUpdate(paymentId, {
    receiptUrl,
  });

  return receiptUrl;
}
