import { connectToDatabase } from "@/lib/db/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Invoice from "@/models/Invoice";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import Lease from "@/models/Lease";

import InvoiceTable from "@/components/invoices/invoices-table";

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
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-semibold mb-4">Invoices</h1>
      <InvoiceTable data={safeInvoices} />
    </div>
  );
}
