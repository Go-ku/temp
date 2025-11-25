import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
// import { normalizeZambiaPhone } from "@/lib/phone/normalize";

export async function sendRentReminderWhatsApp({
  tenant,
  invoice,
  property,
  type,
}) {
  if (!tenant?.phone) return;

//   const phone = normalizeZambiaPhone(tenant.phone);
  const due = new Date(invoice.dueDate).toDateString();
  const outstanding = invoice.amountDue - invoice.amountPaid;

  let message = "";

  if (type === "new") {
    message =
      `Nyumba Rent Invoice\n\n` +
      `Your rent for ${invoice.periodLabel} is now available.\n\n` +
      `Property: ${property.title}\n` +
      `Amount: ZMW ${invoice.amountDue.toLocaleString()}\n` +
      `Due: ${due}\n\n` +
      `View invoice:\n${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice._id}\n\n` +
      `You can pay using MoMo, Airtel Money, or bank transfer.`;
  }

  if (type === "due_soon") {
    message =
      `Upcoming Rent Reminder\n\n` +
      `Your rent for ${invoice.periodLabel} is due soon (${due}).\n` +
      `Outstanding: ZMW ${outstanding.toLocaleString()}\n\n` +
      `View here: ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice._id}`;
  }

  if (type === "due_today") {
    message =
      `Rent Due Today\n\n` +
      `Your rent for ${invoice.periodLabel} is due today.\n` +
      `Outstanding: ZMW ${outstanding.toLocaleString()}\n\n` +
      `Make payment to avoid penalties.\n` +
      `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice._id}`;
  }

  if (type === "overdue") {
    message =
      `Overdue Rent Reminder\n\n` +
      `Your rent for ${invoice.periodLabel} is now overdue.\n\n` +
      `Outstanding: ZMW ${outstanding.toLocaleString()}\n` +
      `Due Date: ${due}\n\n` +
      `Please make payment as soon as possible.\n` +
      `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice._id}`;
  }

  await sendWhatsAppMessage(phone, message);
}
