import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";

import Lease from "@/models/Lease";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/dashboard/SectionCard";

import RentIncreaseModal from "@/components/leases/RentIncreaseModal.jsx";
import TerminateLeaseModal from "@/components/leases/TerminateLeaseModal";
import DeductDepositModal from "@/components/leases/DeductDepositModal";
import RefundDepositModal from "@/components/leases/RefundDepositModal";
import RenewLeaseModal from "@/components/leases/RenewLeaseModal";

export default async function LeaseDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <div className="p-6">Unauthorized</div>;
  }

  await connectToDatabase();

  const lease = await Lease.findById(params.id)
    .populate("tenant")
    .populate("property")
    .populate("landlord")
    .lean();

  if (!lease) return <div className="p-6">Lease not found.</div>;

  // ROLE VALIDATION
  const isAdmin = session.user.roles?.includes("admin");
  const isLandlord =
    lease.landlord && String(lease.landlord._id) === String(session.user.id);

  if (!isAdmin && !isLandlord) {
    return <div className="p-6">You do not have access to this lease.</div>;
  }

  const invoices = await Invoice.find({ lease: lease._id })
    .sort({ dueDate: 1 })
    .lean();

  const payments = await Payment.find({ lease: lease._id })
    .sort({ datePaid: -1 })
    .lean();

  const outstanding = invoices.reduce(
    (sum, inv) => sum + (inv.amountDue - inv.amountPaid),
    0
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const nextInvoice = invoices.find(
    (i) => i.status === "pending" || i.status === "partially_paid"
  ) || null;
  const leaseId = lease._id.toString();
  const safeLeaseForRenewal = {
    _id: leaseId,
    rentAmount: lease.rentAmount,
  };

  const statusVariant = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "terminated":
      case "expired":
        return "bg-gray-200 text-gray-700 border-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Lease overview</p>
          <h1 className="text-2xl font-semibold">Lease Details</h1>
          <p className="text-gray-600">
            {lease.property.title} — Tenant: {lease.tenant.fullName}
          </p>
        </div>

        <Badge className={statusVariant(lease.status)} variant="outline">
          {lease.status}
        </Badge>
      </div>

      {/* QUICK ACTIONS */}
      <SectionCard title="Actions" subtitle="Manage this lease">
        <div className="flex gap-2 flex-wrap">
          <RentIncreaseModal leaseId={leaseId} />
          <TerminateLeaseModal leaseId={leaseId} />
          <DeductDepositModal leaseId={leaseId} />
          <RefundDepositModal leaseId={leaseId} />
          <RenewLeaseModal lease={safeLeaseForRenewal} />

          <Link href={`/invoices?leaseId=${leaseId}`}>
            <Button size="sm" variant="outline">
              View Invoices
            </Button>
          </Link>

          <Link href={`/payments?leaseId=${leaseId}`}>
            <Button size="sm" variant="outline">
              View Payments
            </Button>
          </Link>

          <Link href={`/tenant/${lease.tenant._id.toString()}`}>
            <Button size="sm" variant="outline">
              Tenant Profile
            </Button>
          </Link>

          <Link href={`/properties/${lease.property._id.toString()}`}>
            <Button size="sm" variant="outline">
              Property
            </Button>
          </Link>
          <Link href={`/leases/${leaseId}/agreement`} target="_blank">
            <Button variant="outline" size="sm">
              Download Lease Agreement
            </Button>
          </Link>
        </div>
      </SectionCard>

      {/* LEASE SUMMARY */}
      <SectionCard title="Summary" subtitle="Key lease details">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Tenant</p>
            <p className="font-medium">{lease.tenant.fullName}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Rent Amount</p>
            <p className="font-medium">
              {lease.rentCurrency} {lease.rentAmount.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Deposit</p>
            <p className="font-medium">
              {lease.depositAmount
                ? `${lease.depositCurrency || "ZMW"} ${lease.depositAmount.toLocaleString()}`
                : "No deposit"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="font-medium">
              {new Date(lease.startDate).toLocaleDateString("en-ZM")}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">End Date</p>
            <p className="font-medium">
              {lease.endDate
                ? new Date(lease.endDate).toLocaleDateString("en-ZM")
                : "Open-ended"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Due Day</p>
            <p className="font-medium">Day {lease.dueDay}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Rent Frequency</p>
            <p className="font-medium">{lease.rentFrequency}</p>
          </div>
        </div>
      </SectionCard>

      {/* FINANCIAL SUMMARY */}
      <SectionCard title="Financial Overview" subtitle="Rent and balance">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Outstanding Balance</p>
            <p className="font-semibold text-red-600">
              {lease.rentCurrency} {outstanding.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="font-medium text-green-700">
              {lease.rentCurrency} {totalPaid.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Next Invoice</p>
            <p className="font-medium">
              {nextInvoice
                ? `Due ${new Date(nextInvoice.dueDate).toLocaleDateString("en-ZM")}`
                : "None"}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* INVOICES LIST */}
      <SectionCard title="Invoices" subtitle="All invoices for this lease">
        <div className="space-y-2">
          {invoices.map((inv) => (
            <Link
              key={inv._id}
              href={`/invoices/${inv._id}`}
              className="block border rounded-lg p-3 hover:border-gray-300 transition text-sm"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Invoice {inv.reference}</p>
                  <p className="text-xs text-gray-500">
                    Due {new Date(inv.dueDate).toLocaleDateString("en-ZM")}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={
                    inv.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : inv.status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {inv.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* PAYMENTS LIST */}
      <SectionCard title="Payments" subtitle="All payments for this lease">
        <div className="space-y-2">
          {payments.map((pay) => (
            <Link
              key={pay._id}
              href={`/payments/${pay._id}`}
              className="block border rounded-lg p-3 hover:border-gray-300 transition text-sm"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    ZMW {pay.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(pay.datePaid).toLocaleDateString("en-ZM")}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={
                    pay.status === "successful"
                      ? "bg-green-100 text-green-800"
                      : pay.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {pay.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
