import { pdf } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import Invoice from "@/models/Invoice";
import ReceiptPdf from "@/components/pdf/ReceiptPdf";

export async function GET(req, { params }) {
  await connectToDatabase();
const {id} = await params || {};  
  const payment = await Payment.findById(id)
    .populate("tenant")
    .populate("property")
    .populate("invoice")
    .lean();

  if (!payment) {
    return new NextResponse("Payment not found", { status: 404 });
  }

  const doc = <ReceiptPdf payment={payment} />;
  const file = await pdf(doc).toBuffer();

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
    },
  });
}
