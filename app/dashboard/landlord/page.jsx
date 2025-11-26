import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import Lease from "@/models/Lease";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import FloatingActions from "@/components/dashboard/FloatingActions";
import KpiCard from "@/components/dashboard/KpiCard";
import SectionCard from "@/components/dashboard/SectionCard";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div className="p-6">Unauthorized</div>;

  const landlordId = session.user.id;

  await connectToDatabase();

  // --------------------------
  // FETCH DATA
  // --------------------------
  const properties = await Property.find({ landlord: landlordId }).lean();

  const propertyIds = properties.map((p) => p._id);

  const leases = await Lease.find({ property: { $in: propertyIds } })
    .populate("tenant")
    .lean();

  const activeLeases = leases.filter((l) => l.status === "active");

  const invoices = await Invoice.find({
    lease: { $in: leases.map((l) => l._id) },
  })
    .sort({ dueDate: 1 })
    .lean();

  const rentStatuses = ["pending", "partially_paid", "overdue", "unpaid"];
  const upcomingInvoices = invoices.filter((i) =>
    rentStatuses.includes(i.status)
  );

  const payments = await Payment.find({
    invoice: { $in: invoices.map((i) => i._id) },
    status: "successful",
  })
    .populate("tenant")
    .sort({ datePaid: -1 })
    .lean();

  const maintenanceRequests = await MaintenanceRequest.find({
    property: { $in: propertyIds },
  })
    .populate("property")
    .sort({ createdAt: -1 })
    .lean();
  // --------------------------
  // MONTHLY RENT TREND (last 12 months)
  // --------------------------

  function getLast12Months() {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
      });
    }
    return months;
  }

  const rentTrend = getLast12Months();

  payments.forEach((p) => {
    const d = new Date(p.datePaid);
    const m = rentTrend.find(
      (x) => x.month === d.getMonth() && x.year === d.getFullYear()
    );
    if (m) m.total += p.amount;
  });

  // --------------------------
  // KPI CALCULATIONS
  // --------------------------

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const paymentsThisMonth = payments.filter((p) => {
    const d = new Date(p.datePaid);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const kpiTotalCollected = paymentsThisMonth.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const kpiTotalPending = upcomingInvoices.reduce((sum, inv) => {
    const remaining = inv.amountDue - inv.amountPaid;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  const kpiTotalProperties = properties.length;

  const kpiTotalTenants = activeLeases.length;

  // --------------------------
  // UI
  // --------------------------

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">Welcome back</p>
        <h1 className="text-2xl font-semibold">Landlord Dashboard</h1>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Collected This Month"
          value={`ZMW ${kpiTotalCollected.toLocaleString()}`}
          hint="Successful payments"
        />
        <KpiCard
          label="Pending / Overdue"
          value={`ZMW ${kpiTotalPending.toLocaleString()}`}
          hint="Unpaid rent balance"
        />
        <KpiCard
          label="Properties"
          value={kpiTotalProperties}
          hint="Units you manage"
        />
        <KpiCard
          label="Active Tenants"
          value={kpiTotalTenants}
          hint="Current leases"
        />
      </div>

      {/* PROPERTIES */}
      <SectionCard
        title="Your Properties"
        subtitle="Properties you own and manage"
      >
        <div className="grid gap-3">
          {properties.map((p) => (
            <Link
              key={p._id}
              href={`/properties/${p._id}`}
              className="block border rounded-lg p-4 bg-white hover:border-gray-300 transition"
            >
              <div className="flex justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    {p.address?.town}, {p.address?.city}
                  </p>
                  <p className="text-xs text-gray-400">{p.type}</p>
                </div>

                <Badge variant="secondary" className="self-start">
                  {
                    leases.filter((l) => String(l.property) === String(p._id))
                      .length
                  }{" "}
                  tenants
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* UPCOMING INVOICES */}
      <SectionCard
        title="Upcoming Rent"
        subtitle="Next invoices due from tenants"
      >
        <div className="space-y-2">
          {upcomingInvoices.slice(0, 5).map((inv) => (
            <Link
              key={inv._id}
              href={`/invoices/${inv._id}`}
              className="block p-3 border rounded-lg hover:border-gray-300 transition"
            >
              <div className="flex justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Invoice {inv.reference}</p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(inv.dueDate).toDateString()}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={
                    inv.status === "overdue"
                      ? "text-red-700 border-red-700"
                      : "text-yellow-700 border-yellow-700"
                  }
                >
                  {inv.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* RECENT PAYMENTS */}
      <SectionCard title="Recent Payments" subtitle="Latest successful receipts">
        <div className="space-y-2">
          {payments.slice(0, 5).map((p) => (
            <Link
              key={p._id}
              href={`/payments/${p._id}`}
              className="block p-3 border rounded-lg hover:border-gray-300 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">ZMW {p.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{p.tenant.fullName}</p>
                </div>

                <p className="text-xs">
                  {new Date(p.datePaid).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* MAINTENANCE */}
      <SectionCard title="Maintenance" subtitle="Recent maintenance tickets">
        <div className="space-y-2">
          {maintenanceRequests.slice(0, 5).map((m) => (
            <Link
              key={m._id}
              href={`/maintenance/${m._id}`}
              className="block p-3 border rounded-lg hover:border-gray-300 transition"
            >
              <div className="flex justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{m.title}</p>
                  <p className="text-xs text-gray-500">{m.property.title}</p>
                </div>

                <Badge variant="outline">{m.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
      <FloatingActions role="landlord" />
    </div>
  );
}
