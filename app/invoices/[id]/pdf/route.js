import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import Invoice from "@/models/Invoice";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import Lease from "@/models/Lease";
import { connectToDatabase } from "@/lib/db/mongoose";
import InvoicePdf from "@/components/pdf/InvoicePdf";

export async function GET(req, { params }) {
  await connectToDatabase();

  const { id } = await params || {};
  if (!id) {
    return new NextResponse("Invoice id missing", { status: 400 });
  }

  const invoice = await Invoice.findById(id)
    .populate("tenant")
    .populate("property")
    .populate("lease")
    .lean();

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const pdfDoc = <InvoicePdf invoice={invoice} />;
  const file = await pdf(pdfDoc).toBuffer();

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.reference}.pdf"`,
    },
  });
}
