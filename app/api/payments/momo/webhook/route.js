import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import { connectToDatabase } from "@/lib/db/mongoose";
import { updateInvoiceFromPayments } from "@/app/(actions)/invoices";
import { sendPaymentReceiptEmail } from "@/lib/notifications/email";
import { sendPaymentReceiptSms } from "@/lib/notifications/sms";
import { generateReceiptForPayment } from "@/lib/pdf/generateReceipt";
export async function POST(req) {
  await connectToDatabase();

  const webhookSecret = process.env.MOMO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== webhookSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();

  const { financialTransactionId, externalId, status } = body || {};

  if (!externalId || !status) {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
      { status: 400 }
    );
  }

  const payment = await Payment.findOne({
    externalRef: externalId,
  });

  if (!payment) {
    return NextResponse.json({ success: false, error: "Payment not found" });
  }

  const normalizedStatus = status.toUpperCase();

  // Idempotency: if already processed as successful, exit quietly
  if (payment.status === "successful" && normalizedStatus === "SUCCESSFUL") {
    return NextResponse.json({ success: true, message: "Already processed" });
  }

  if (normalizedStatus === "SUCCESSFUL") {
    payment.status = "successful";
    payment.transactionId = financialTransactionId;
    await payment.save();
    
    if (payment.invoice) {
      await updateInvoiceFromPayments(payment.invoice);
    }
    await generateReceiptForPayment(payment._id);

await sendPaymentReceiptEmail(payment._id);
await sendPaymentReceiptSms(payment._id);
  } else if (normalizedStatus === "FAILED" || normalizedStatus === "REJECTED") {
    payment.status = "failed";
    await payment.save();
  } else {
    return NextResponse.json(
      { success: false, error: "Unhandled status" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
