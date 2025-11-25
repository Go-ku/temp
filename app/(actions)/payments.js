"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";
import Lease from "@/models/Lease";
import { updateInvoiceFromPayments } from "@/app/(actions)/invoices";

export async function createPayment(data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
    await connectToDatabase();

  try {
    // Prevent duplicate receipt numbers
    const existing = await Payment.findOne({
      receiptNumber: data.receiptNumber,
    });
    if (existing) {
      return {
        success: false,
        errors: { receiptNumber: "Receipt number already exists" },
      };
    }

    // Auto-fill related fields
    const lease = await Lease.findById(data.lease).populate("property tenant");
    if (!lease) return { success: false, errors: { lease: "Lease not found" } };

    data.property = lease.property._id;
    data.tenant = lease.tenant._id;

    const payment = await Payment.create(data);
    if (data.invoice) {
  await updateInvoiceFromPayments(data.invoice);
}
await generateReceiptForPayment(payment._id);
  await sendPaymentReceiptEmail(payment._id);
  await sendPaymentReceiptSms(payment._id);

    return { success: true, data: payment };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function listPayments(query = {}) {
  await connectToDatabase();
  const payments = await Payment.find(query)
    .populate("lease")
    .populate("property")
    .populate("tenant")
    .sort({ datePaid: -1 });

  return { success: true, data: payments };
}

export async function getPayment(id) {
  await connectToDatabase();
  const payment = await Payment.findById(id)
    .populate("lease")
    .populate("tenant")
    .populate("property");

  return { success: !!payment, data: payment };
}

export async function deletePayment(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
    await connectToDatabase();
  await Payment.findByIdAndDelete(id);
  return { success: true };
}
