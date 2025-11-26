import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";
import Property from "@/models/Property";
import "@/models/Tenant"; // register for populate
import "@/models/Invoice"; // register for populate
import PaymentsTable from "@/components/payments/payments-table";
import SectionCard from "@/components/dashboard/SectionCard";

export const metadata = {
  title: "Payments",
};

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div className="p-4">Unauthorized</div>;
  }

  const role = session.user.roles?.[0];

  await connectToDatabase();

  let payments = [];

  if (role === "admin") {
    // admin sees all payments
    payments = await Payment.find({})
      .populate("tenant")
      .populate("property")
      .populate("invoice")
      .sort({ datePaid: -1 })
      .lean();
  }

  if (role === "landlord") {
    // landlord payments = payments for their properties
    const properties = await Property.find({
      landlord: session.user.id,
    }).lean();

    const ids = properties.map((p) => p._id);

    payments = await Payment.find({
      property: { $in: ids },
    })
      .populate("tenant")
      .populate("property")
      .populate("invoice")
      .sort({ datePaid: -1 })
      .lean();
  }

  if (role === "tenant") {
    // tenant sees only their payments
    payments = await Payment.find({
      tenant: session.user.tenantId,
    })
      .populate("tenant")
      .populate("property")
      .populate("invoice")
      .sort({ datePaid: -1 })
      .lean();
  }

  // Ensure data is serializable for the client table
  const safePayments = JSON.parse(JSON.stringify(payments));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">Financials</p>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-gray-600">
          Track all received and pending payments.
        </p>
      </div>

      <SectionCard title="All Payments">
        <PaymentsTable data={safePayments} />
      </SectionCard>
    </div>
  );
}
