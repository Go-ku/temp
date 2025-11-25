import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Invoice from "@/models/Invoice";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import { sendRentReminderWhatsApp } from "@/lib/notifications/whatsappRentReminder";

export async function GET() {
  await connectToDatabase();

  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  const invoices = await Invoice.find({
    status: { $in: ["pending", "partially_paid"] },
    dueDate: {
      $gte: new Date(
        threeDaysFromNow.getFullYear(),
        threeDaysFromNow.getMonth(),
        threeDaysFromNow.getDate(),
        0,
        0
      ),
      $lt: new Date(
        threeDaysFromNow.getFullYear(),
        threeDaysFromNow.getMonth(),
        threeDaysFromNow.getDate(),
        23,
        59
      ),
    },
  })
    .populate("tenant")
    .populate("property");

  for (const inv of invoices) {
    await sendRentReminderWhatsApp({
      tenant: inv.tenant,
      invoice: inv,
      property: inv.property,
      type: "due_soon",
    });
  }

  return NextResponse.json({ success: true, count: invoices.length });
}
