import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";
import { recordRefundAdjustment } from "@/app/(actions)/payments";

export async function POST(req) {
  await connectToDatabase();

  const body = await req.json();
  const { paymentId, amount } = body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return NextResponse.json({ success: false, error: "Payment not found" });
  }

  if (payment.status !== "successful") {
    return NextResponse.json({
      success: false,
      error: "Only successful payments can be refunded",
    });
  }

  const refundAmount = amount || payment.amount;
  if (refundAmount > payment.amount) {
    return NextResponse.json({
      success: false,
      error: "Refund amount cannot exceed original payment",
    });
  }

  if (payment.refundStatus === "requested" || payment.refundStatus === "refunded") {
    return NextResponse.json({
      success: false,
      error: "Refund already requested or completed",
    });
  }

  const refundRef = `MOMO-REF-${payment._id}-${Date.now()}`;

  // Mark local state as requested
  payment.refundStatus = "requested";
  payment.refundAmount = refundAmount;
  payment.refundExternalRef = refundRef;
  await payment.save();

  // Call MoMo reversal/refund endpoint (placeholder URL, check real docs)
  const momoUrl = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/reversals`;

  try {
    await axios.post(
      momoUrl,
      {
        amount: refundAmount.toString(),
        currency: payment.currency || "ZMW",
        referenceId: payment.externalRef, // original requestToPay ref
        reason: "Customer refund",
      },
      {
        headers: {
          "X-Target-Environment": process.env.MOMO_TARGET_ENV,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_API_KEY,
          "Content-Type": "application/json",
          "X-Callback-Url": process.env.MOMO_REFUND_CALLBACK_URL,
        },
      }
    );

    return NextResponse.json({ success: true, message: "Refund requested" });
  } catch (err) {
    console.error("MoMo refund error:", err.response?.data || err);

    payment.refundStatus = "failed";
    await payment.save();

    return NextResponse.json({
      success: false,
      error: "Failed to request refund",
    });
  }
}
