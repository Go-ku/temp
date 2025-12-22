import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";

import Property from "@/models/Property";
import Lease from "@/models/Lease";
import Invoice from "@/models/Invoice";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import RentIncreaseModal from "@/components/leases/RentIncreaseModal.jsx";
import TerminateLeaseModal from "@/components/leases/TerminateLeaseModal";

export default async function PropertyLeasesPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div className="p-4">Unauthorized</div>;

  await connectToDatabase();
const {id} = await params || {};    
  const property = await Property.findById(id)
    .populate("landlord")
    .lean();

  if (!property) {
    return <div className="p-6">Property not found.</div>;
  }

  const isAdmin = session.user.roles?.includes("admin");
  const isLandlord =
    property.landlord &&
    String(property.landlord._id) === String(session.user.id);

  if (!isAdmin && !isLandlord) {
    return <div className="p-6">You are not allowed to view these leases.</div>;
  }

  const leases = await Lease.find({ property: id })
    .populate("tenant")
    .lean();

  const leaseIds = leases.map((l) => l._id);

  const invoices = await Invoice.find({ lease: { $in: leaseIds } }).lean();

  // Compute outstanding balance per lease
  const outstandingByLease = {};
  for (const inv of invoices) {
    const key = String(inv.lease);
    const outstanding = (inv.amountDue || 0) - (inv.amountPaid || 0);
    if (!outstandingByLease[key]) outstandingByLease[key] = 0;
    outstandingByLease[key] += outstanding;
  }

  const statusVariant = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "terminated":
      case "expired":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            Leases for {property.title}
          </h1>
          <p className="text-sm text-gray-600">
            {property.address?.town}, {property.address?.city} ·{" "}
            {property.type}
          </p>
        </div>

        <Link href={`/leases/new?propertyId=${property._id}`}>
          <Button>New Lease</Button>
        </Link>
      </div>

      {/* No leases case */}
      {leases.length === 0 && (
        <div className="border rounded-xl p-4 bg-blue-50 border-blue-200 text-sm text-blue-900">
          <p className="font-semibold mb-1">No leases yet</p>
          <p>
            This property does not have any leases. Create a lease to start
            tracking rent, invoices, and tenant payments.
          </p>
          <div className="mt-3">
            <Link href={`/leases/new?propertyId=${property._id}`}>
              <Button size="sm">Create First Lease</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Lease list */}
      {leases.length > 0 && (
        <div className="space-y-3">
          {leases.map((lease) => {
            const key = String(lease._id);
            const outstanding = outstandingByLease[key] || 0;

            return (
              <div
                key={key}
                className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Tenant
                    </p>
                    <p className="font-semibold">
                      {lease.tenant?.fullName || "Unknown Tenant"}
                    </p>
                    {lease.tenant?.phone && (
                      <p className="text-xs text-gray-500">
                        {lease.tenant.phone}
                      </p>
                    )}
                  </div>

                  <Badge
                    variant="outline"
                    className={statusVariant(lease.status)}
                  >
                    {lease.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Rent</p>
                    <p className="font-medium">
                      {lease.rentCurrency || "ZMW"}{" "}
                      {lease.rentAmount?.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {lease.startDate
                        ? new Date(lease.startDate).toLocaleDateString(
                            "en-ZM"
                          )
                        : "—"}
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
                    <p className="font-medium">
                      {lease.dueDay ? `Day ${lease.dueDay}` : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Deposit</p>
                    <p className="font-medium">
                      {lease.depositAmount
                        ? `${lease.depositCurrency || "ZMW"} ${lease.depositAmount.toLocaleString()}`
                        : "None recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Outstanding</p>
                    <p
                      className={
                        outstanding > 0
                          ? "font-semibold text-red-600"
                          : "font-medium text-green-700"
                      }
                    >
                      {lease.rentCurrency || "ZMW"}{" "}
                      {outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link href={`/leases/${lease._id.toString()}`}>
                    <Button size="sm" variant="outline">
                      View Lease
                    </Button>
                  </Link>

                  <Link href={`/invoices?leaseId=${lease._id.toString()}`}>
                    <Button size="sm" variant="outline">
                      View Invoices
                    </Button>
                  </Link>

                  <Link href={`/payments?leaseId=${lease._id.toString()}`}>
                    <Button size="sm" variant="outline">
                      View Payments
                    </Button>
                  </Link>
                  <div className="flex flex-wrap gap-2 pt-2">
  <Link href={`/leases/${lease._id.toString()}`}>
    <Button size="sm" variant="outline">View Lease</Button>
  </Link>

  <RentIncreaseModal leaseId={lease._id.toString()} />
  <TerminateLeaseModal leaseId={lease._id.toString()} />

  <Link href={`/invoices?leaseId=${lease._id.toString()}`}>
    <Button size="sm" variant="outline">Invoices</Button>
  </Link>

  <Link href={`/payments?leaseId=${lease._id.toString()}`}>
    <Button size="sm" variant="outline">Payments</Button>
  </Link>
</div>


                  {/* Future: Rent increase / termination actions */}
                  {/* <Button size="sm" variant="secondary">Increase Rent</Button> */}
                  {/* <Button size="sm" variant="destructive">Terminate Lease</Button> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
