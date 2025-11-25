import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";

export async function GET(req, { params }) {
  await connectToDatabase();

  const payment = await Payment.findById(params.id).lean();

  if (!payment) {
    return NextResponse.json({
      success: false,
      error: "Payment not found",
    });
  }

  return NextResponse.json({
    success: true,
    status: payment.status,
    invoice: payment.invoice,
  });
}
