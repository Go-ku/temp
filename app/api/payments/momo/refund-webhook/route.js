import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";
import { recordRefundAdjustment } from "@/app/(actions)/payments";

export async function POST(req) {
  await connectToDatabase();

  const body = await req.json();
  const { externalId, status } = body; // structure depends on MoMo; adapt to real payload

  const payment = await Payment.findOne({ refundExternalRef: externalId });
  if (!payment) {
    return NextResponse.json({ success: false, error: "Payment not found" });
  }

  if (status === "SUCCESSFUL") {
    payment.refundStatus = "refunded";
    payment.refundedAt = new Date();
    await payment.save();

    // Create negative payment to adjust invoice
    if (payment.refundAmount > 0) {
      await recordRefundAdjustment(payment, payment.refundAmount);
    }
  } else {
    payment.refundStatus = "failed";
    await payment.save();
  }

  return NextResponse.json({ success: true });
}
