import { connectToDatabase } from "@/lib/db/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Invoice from "@/models/Invoice";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import Lease from "@/models/Lease";

import InvoiceTable from "@/components/invoices/invoices-table";
import SectionCard from "@/components/dashboard/SectionCard";

export default async function InvoicesPage() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session?.user) return <div>Unauthorized</div>;

  const role = session.user.roles?.[0];
  const userId = session.user.id;

  let invoices = [];

  if (role === "admin") {
    invoices = await Invoice.find({})
      .populate("tenant")
      .populate("property")
      .lean();
  }

  if (role === "landlord") {
    // find properties owned by landlord → then invoices
    const props = await Property.find({ landlord: userId }).lean();
    const ids = props.map((p) => p._id);

    invoices = await Invoice.find({ property: { $in: ids } })
      .populate("tenant")
      .populate("property")
      .lean();
  }

  if (role === "tenant") {
    const tenant = await Tenant.findOne({ user: userId }).lean();
    if (tenant) {
      invoices = await Invoice.find({ tenant: tenant._id })
        .populate("tenant")
        .populate("property")
        .lean();
    }
  }

  const safeInvoices = JSON.parse(JSON.stringify(invoices));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">Billing</p>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-gray-600">
          All invoices across your portfolio.
        </p>
      </div>
      <SectionCard title="All Invoices">
        <InvoiceTable data={safeInvoices} />
      </SectionCard>
    </div>
  );
}
