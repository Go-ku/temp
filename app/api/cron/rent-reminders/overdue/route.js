export async function GET() {
  await connectToDatabase();

  const now = new Date();

  const invoices = await Invoice.find({
    status: "overdue",
    dueDate: { $lt: now },
  })
    .populate("tenant")
    .populate("property");

  for (const inv of invoices) {
    await sendRentReminderWhatsApp({
      tenant: inv.tenant,
      invoice: inv,
      property: inv.property,
      type: "overdue",
    });
  }

  return NextResponse.json({ success: true, count: invoices.length });
}
