import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { connectToDatabase } from "@/lib/db/mongoose";
import Payment from "@/models/Payment";
import Tenant from "@/models/Tenant";
import Property from "@/models/Property";
import Invoice from "@/models/Invoice";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PaymentDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div className="p-4">Unauthorized</div>;

  await connectToDatabase();
    const {id} = await params || {};    
  const payment = await Payment.findById(id)
    .populate("tenant")
    .populate("property")
    .populate("invoice")
    .lean();

  if (!payment) {
    return <div className="p-4">Payment not found.</div>;
  }

  const isAdmin = session.user.roles?.includes("admin");
  const isLandlord = session.user.roles?.includes("landlord");
  const isTenant = session.user.roles?.includes("tenant");

  // Only allow landlord to view payments belonging to their properties
  if (isLandlord && payment.property.landlord.toString() !== session.user.id) {
    return <div className="p-4">Unauthorized</div>;
  }

  // Only allow tenant to view their own payments
  if (isTenant && payment.tenant.user.toString() !== session.user.id) {
    return <div className="p-4">Unauthorized</div>;
  }

  const statusColor =
    payment.status === "successful"
      ? "bg-green-100 text-green-800"
      : payment.status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : payment.status === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Payment Receipt</h1>

        <Badge className={statusColor} variant="outline">
          {payment.status}
        </Badge>
      </div>


      {/* Main Card */}
      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">

        {/* Section 1: Payment Info */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Payment Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Receipt No.</p>
              <p className="font-medium">{payment.receiptNumber}</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Amount Paid</p>
              <p className="font-medium">ZMW {payment.amount.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Payment Method</p>
              <p className="font-medium">
                {payment.method.replace("_", " ")}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Date Paid</p>
              <p className="font-medium">
                {new Date(payment.datePaid).toLocaleDateString("en-ZM")}
              </p>
            </div>

            {payment.transactionId && (
              <div>
                <p className="text-gray-500 text-xs">Transaction ID</p>
                <p className="font-medium">{payment.transactionId}</p>
              </div>
            )}
          </div>
        </div>


        {/* Section 2: Tenant Info */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Tenant</h2>
          <div className="text-sm">
            <p className="font-medium">{payment.tenant.fullName}</p>
            {payment.tenant.email && <p className="text-gray-600">{payment.tenant.email}</p>}
            {payment.tenant.phone && <p className="text-gray-600">{payment.tenant.phone}</p>}
          </div>
        </div>


        {/* Section 3: Property Info */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Property</h2>
          <p className="text-sm">{payment.property.title}</p>
        </div>


        {/* Section 4: Invoice Link */}
        {payment.invoice && (
          <div>
            <h2 className="text-sm font-semibold mb-2">Related Invoice</h2>
            <Link href={`/invoices/${payment.invoice._id}`}>
              <Button size="sm" variant="outline">
                View Invoice
              </Button>
            </Link>
          </div>
        )}

      </div>


      {/* Footer Buttons */}
      <div className="flex flex-wrap gap-3">

        {/* Receipt PDF */}
        {payment.status === "successful" && (
          <Link href={`/payments/${payment._id}/receipt`} target="_blank">
            <Button>Download Receipt PDF</Button>
          </Link>
        )}

        {/* Refund button for admin/landlord */}
        {(isAdmin || isLandlord) && payment.status === "successful" && (
          <Link href={`/payments/${payment._id}/refund`}>
            <Button variant="destructive">Issue Refund</Button>
          </Link>
        )}

        {/* Back */}
        <Link href="/payments">
          <Button variant="outline">Back to Payments</Button>
        </Link>
      </div>

    </div>
  );
}
