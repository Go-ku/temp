    import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";

import { connectToDatabase } from "@/lib/db/mongoose";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";

export async function POST(req) {
  await connectToDatabase();
  const { invoiceId, phone } = await req.json();

  const invoice = await Invoice.findById(invoiceId)
    .populate("tenant")
    .populate("property")
    .lean();

  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found" });
  }

  const amount = invoice.amountDue - invoice.amountPaid;

  // Generate transaction reference
  const externalId = `MOMO-${invoiceId}-${Date.now()}`;

  // Save “pending” payment record
  const payment = await Payment.create({
    tenant: invoice.tenant._id,
    property: invoice.property._id,
    lease: invoice.lease,
    invoice: invoice._id,
    method: "mtn_momo",
    receiptNumber: externalId,
    externalRef: externalId,
    amount,
    status: "pending",
    datePaid: new Date(),
  });

  const momoUrl = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay`;

  try {
    const res = await axios.post(
      momoUrl,
      {
        amount: amount.toString(),
        currency: "ZMW",
        externalId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phone,
        },
        payerMessage: "Rent Payment",
        payeeNote: "Rent Payment",
      },
      {
        headers: {
          "X-Reference-Id": externalId,
          "X-Target-Environment": process.env.MOMO_TARGET_ENV,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_API_KEY,
          "Content-Type": "application/json",
          "X-Callback-Url": process.env.MOMO_CALLBACK_URL,
        },
      }
    );

    return NextResponse.json({
      success: true,
      paymentId: payment._id,
      externalId,
    });
  } catch (err) {
    console.error("MoMo Error:", err.response?.data || err);

    return NextResponse.json({
      success: false,
      error: "Failed to initiate payment",
    });
  }
}
