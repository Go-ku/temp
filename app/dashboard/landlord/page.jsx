import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import Lease from "@/models/Lease";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import DashboardClient from "@/components/dashboard/DashboardClient";// We will create this next

export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div className="p-6">Unauthorized</div>;

  const landlordId = session.user.id;
  await connectToDatabase();

  // --- FETCHING DATA (Kept mostly the same) ---
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

  // --- DATA PROCESSING ---
  
  // 1. Rent Trend Calculation
  const now = new Date();
  const rentTrend = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rentTrend.push({
      name: d.toLocaleString("en-US", { month: "short" }), // specific key for Recharts
      total: 0,
      month: d.getMonth(),
      year: d.getFullYear(),
    });
  }

  payments.forEach((p) => {
    const d = new Date(p.datePaid);
    const m = rentTrend.find(
      (x) => x.month === d.getMonth() && x.year === d.getFullYear()
    );
    if (m) m.total += p.amount;
  });

  // 2. KPI Calculations
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const paymentsThisMonth = payments.filter((p) => {
    const d = new Date(p.datePaid);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const stats = {
    collected: paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0),
    pending: upcomingInvoices.reduce((sum, inv) => {
      const remaining = inv.amountDue - inv.amountPaid;
      return sum + (remaining > 0 ? remaining : 0);
    }, 0),
    totalProperties: properties.length,
    activeTenants: activeLeases.length,
  };

  // Serialize data to avoid "Only plain objects..." errors in Next.js
  const serialize = (data) => JSON.parse(JSON.stringify(data));

  return (
    <DashboardClient 
      user={session.user}
      stats={stats}
      rentTrend={serialize(rentTrend)}
      properties={serialize(properties)}
      upcomingInvoices={serialize(upcomingInvoices)}
      recentPayments={serialize(payments)}
      maintenanceRequests={serialize(maintenanceRequests)}
      leaseCount={leases.length}
    />
  );
}