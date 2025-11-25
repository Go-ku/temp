import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";

import Property from "@/models/Property";
import Lease from "@/models/Lease";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";

import KpiCard from "@/components/dashboard/KpiCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickLinks from "@/components/dashboard/QuickLinks";
function buildRevenueSeries(raw) {
  // Convert aggregation into [{label: "Jan", amount: 1234}, ...]
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return raw.map((r) => ({
    label: `${monthNames[r._id.month - 1]} ${String(r._id.year).slice(-2)}`,
    amount: r.total,
  }));
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.roles?.includes("admin")) {
    console.log("Unauthorized access attempt to admin dashboard", session.user);
    return <div className="p-4">Unauthorized</div>;
  }

  await connectToDatabase();

  // KPIs
  const [totalProperties, activeLeases, invoiceAgg, outstandingInvoices] =
    await Promise.all([
      Property.countDocuments({}),
      Lease.countDocuments({ status: "active" }),
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalDue: { $sum: "$amountDue" },
            totalPaid: { $sum: "$amountPaid" },
          },
        },
      ]),
      Invoice.find({
        status: { $in: ["pending", "partially_paid", "overdue"] },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate("tenant")
        .populate("property")
        .lean(),
    ]);

  const invoiceTotals = invoiceAgg[0] || { totalDue: 0, totalPaid: 0 };
  const totalOutstanding = invoiceTotals.totalDue - invoiceTotals.totalPaid;

  // Revenue last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const revenueRaw = await Payment.aggregate([
    {
      $match: {
        status: "successful",
        datePaid: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$datePaid" },
          month: { $month: "$datePaid" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const revenueSeries = buildRevenueSeries(revenueRaw);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Properties"
          value={totalProperties}
          hint="All managed units"
        />
        <KpiCard
          label="Active Leases"
          value={activeLeases}
          hint="Currently occupied"
        />
        <KpiCard
          label="Outstanding Balance (ZMW)"
          value={totalOutstanding.toLocaleString()}
          hint="Unpaid / partially paid invoices"
        />
      </div>

      {/* Quick Links */}
      <QuickLinks role="admin" />

      {/* Revenue chart */}
      <RevenueChart data={revenueSeries} />

      {/* Outstanding invoices list */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <h2 className="text-sm font-semibold mb-3">
          Most Overdue / Outstanding Invoices
        </h2>
        <div className="space-y-2 text-sm">
          {outstandingInvoices.length === 0 && (
            <p className="text-gray-500">No outstanding invoices 🎉</p>
          )}

          {outstandingInvoices.map((inv) => {
            const balance = inv.amountDue - inv.amountPaid;
            return (
              <div
                key={inv._id}
                className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0"
              >
                <div>
                  <div className="font-medium">
                    {inv.reference} — {inv.tenant.fullName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {inv.property.title} · Due{" "}
                    {new Date(inv.dueDate).toLocaleDateString("en-ZM")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Outstanding</div>
                  <div className="font-semibold">
                    ZMW {balance.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
