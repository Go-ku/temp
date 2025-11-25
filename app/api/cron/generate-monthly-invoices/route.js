// app/api/cron/generate-monthly-invoices/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Lease from "@/models/Lease";
import Invoice from "@/models/Invoice";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";

export async function GET() {
  await connectToDatabase();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const periodLabel = `${year}-${String(month + 1).padStart(2, "0")}`;

  // Get all active monthly leases
  const leases = await Lease.find({
    status: "active",
    rentFrequency: "monthly",
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  })
    .populate("property")
    .populate("tenant");

  let createdCount = 0;

  for (const lease of leases) {
    const existing = await Invoice.findOne({
      lease: lease._id,
      periodLabel,
    });

    if (existing) continue;

    // dueDay from lease
    const dueDay = lease.dueDay || 1;
    const dueDate = new Date(year, month, dueDay);

    const reference = `INV-${lease._id.toString().slice(-4)}-${periodLabel}`;

    await Invoice.create({
      lease: lease._id,
      tenant: lease.tenant._id,
      property: lease.property._id,
      periodLabel,
      issueDate: now,
      dueDate,
      amountDue: lease.rentAmount,
      currency: lease.rentCurrency || "ZMW",
      status: "pending",
      amountPaid: 0,
      reference,
    });

    createdCount++;
  }

  return NextResponse.json({
    success: true,
    created: createdCount,
    period: periodLabel,
  });
}
