import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";

import Tenant from "@/models/Tenant";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";

import KpiCard from "@/components/dashboard/KpiCard";
import QuickLinks from "@/components/dashboard/QuickLinks";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import PayNowWrapper from "@/components/payments/PayNowWrapper";

export default async function TenantDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.roles?.includes("tenant")) {
    return <div className="p-4">Unauthorized</div>;
  }

  await connectToDatabase();
  if (!user?.hasCompletedOnboarding) {
    redirect("/tenant/onboarding");
  }

  const tenant = await Tenant.findOne({ user: session.user.id }).lean();
  if (!tenant) {
    return (
      <div className="p-4">No tenant record linked to your account yet.</div>
    );
  }
   // ⬅ If onboarding not completed, redirect
  
  // Get invoices & payments
  const [invoices, payments] = await Promise.all([
    Invoice.find({ tenant: tenant._id }).sort({ dueDate: 1 }).lean(),
    Payment.find({ tenant: tenant._id, status: "successful" })
      .sort({ datePaid: -1 })
      .limit(5)
      .lean(),
  ]);

  const outstanding = invoices.reduce((sum, inv) => {
    if (["pending", "partially_paid", "overdue"].includes(inv.status)) {
      return sum + (inv.amountDue - inv.amountPaid);
    }
    return sum;
  }, 0);

  const nextInvoice = invoices.find(
    (inv) => inv.status !== "paid" && inv.dueDate >= new Date()
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Welcome, {tenant.fullName}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Outstanding Balance (ZMW)"
          value={outstanding.toLocaleString()}
          hint="Total unpaid invoices"
        />
        <KpiCard
          label="Next Due Date"
          value={
            nextInvoice
              ? new Date(nextInvoice.dueDate).toLocaleDateString("en-ZM")
              : "No upcoming rent"
          }
          hint={nextInvoice ? nextInvoice.reference : ""}
        />
        <KpiCard
          label="Recent Payments"
          value={payments.length}
          hint="Last 5 payments shown below"
        />
      </div>

          {nextInvoice && (
        <PayNowWrapper
          invoice={{
            _id: nextInvoice._id,
            reference: nextInvoice.reference,
            outstanding: nextInvoice.amountDue - nextInvoice.amountPaid,
          }}
        />
      )}
      {nextInvoice && (
        <Link href={`/pay/${nextInvoice._id}`}>
          <Button className="w-full sm:w-auto">Pay Now</Button>
        </Link>
      )}

      <QuickLinks role="tenant" />

      {/* Recent payments list */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Recent Payments</h2>
        <div className="space-y-2 text-sm">
          {payments.length === 0 && (
            <p className="text-gray-500">No payments recorded yet.</p>
          )}

          {payments.map((p) => (
            <div
              key={p._id}
              className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0"
            >
              <div>
                <div className="font-medium">
                  ZMW {p.amount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(p.datePaid).toLocaleDateString("en-ZM")} ·{" "}
                  {p.method}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Receipt: {p.receiptNumber}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
