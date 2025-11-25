// app/api/cron/update-overdue-and-reminders/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import Invoice from "@/models/Invoice";
import Tenant from "@/models/Tenant";
import Lease from "@/models/Lease";
import Property from "@/models/Property";
import { sendEmail } from "@/lib/email/sendEmail";

export async function GET() {
  await connectToDatabase();

  const now = new Date();

  // Invoices that are not fully paid and past due
  const invoices = await Invoice.find({
    status: { $in: ["pending", "partially_paid"] },
    dueDate: { $lt: now },
  })
    .populate("tenant")
    .populate("property")
    .populate("lease");

  let updated = 0;
  let emailed = 0;

  for (const inv of invoices) {
    if (inv.status !== "overdue") {
      inv.status = "overdue";
      await inv.save();
      updated++;
    }

    const tenant = inv.tenant;
    if (tenant?.email) {
      emailed++;

      const subject = `Rent overdue for ${inv.periodLabel} – ${inv.property?.title}`;
      const balance = inv.amountDue - inv.amountPaid;

      const text = `Dear ${tenant.fullName},

This is a reminder that your rent invoice (${inv.reference}) for period ${inv.periodLabel} is overdue.

Amount due: ${inv.amountDue} ${inv.currency}
Amount paid: ${inv.amountPaid} ${inv.currency}
Outstanding: ${balance} ${inv.currency}

Please make payment as soon as possible.

Regards,
Nyumba Real Estate`;

      const html = text.replace(/\n/g, "<br />");

      await sendEmail({
        to: tenant.email,
        subject,
        text,
        html,
      });
    }
  }

  return NextResponse.json({
    success: true,
    updated,
    emailed,
  });
}
