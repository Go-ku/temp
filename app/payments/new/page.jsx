// app/payments/new/page.jsx
import { connectToDatabase } from "@/lib/db/mongoose";
import Lease from "@/models/Lease";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import { createPayment } from "@/app/(actions)/payments";
import PaymentForm from "@/components/forms/payment-form";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage() {
  await connectToDatabase();

  const leases = await Lease.find({})
    .populate("tenant")
    .populate("property")
    .lean();

  return (
    <div className="p-4 sm:p-6">
      <PaymentForm leases={leases} onSubmit={createPayment} />
    </div>
  );
}
