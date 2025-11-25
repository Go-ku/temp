export async function GET() {
  await connectToDatabase();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

  const invoices = await Invoice.find({
    status: { $in: ["pending", "partially_paid"] },
    dueDate: { $gte: start, $lt: end },
  })
    .populate("tenant")
    .populate("property");

  for (const inv of invoices) {
    await sendRentReminderWhatsApp({
      tenant: inv.tenant,
      invoice: inv,
      property: inv.property,
      type: "due_today",
    });
  }

  return NextResponse.json({ success: true, count: invoices.length });
}
