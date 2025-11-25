import { pdf } from "@react-pdf/renderer";
import Lease from "@/models/Lease";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import LeaseAgreementPdf from "@/components/pdf/LeaseAgreementPdf";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectToDatabase();

  const lease = await Lease.findById(params.id)
    .populate("tenant")
    .populate("property")
    .populate("landlord")
    .lean();

  if (!lease) {
    return new NextResponse("Lease not found", { status: 404 });
  }

  const doc = <LeaseAgreementPdf lease={lease} />;
  const file = await pdf(doc).toBuffer();

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="lease-agreement-${lease._id}.pdf"`,
    },
  });
}
