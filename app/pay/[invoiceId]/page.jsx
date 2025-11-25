import { connectToDatabase } from "@/lib/db/mongoose";
import Invoice from "@/models/Invoice";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PayInvoicePage({ params }) {
  await connectToDatabase();

  const { invoiceId } = params || {};
  if (!invoiceId) {
    return <div className="p-4">Invoice not found.</div>;
  }

  const invoice = await Invoice.findById(invoiceId)
    .populate("tenant")
    .populate("property")
    .lean();

  if (!invoice) {
    return <div className="p-4">Invoice not found.</div>;
  }

  const balance = invoice.amountDue - invoice.amountPaid;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Pay Invoice</h1>

      <div className="border p-4 rounded-lg space-y-2">
        <p><strong>Invoice:</strong> {invoice.reference}</p>
        <p><strong>Property:</strong> {invoice.property.title}</p>
        <p><strong>Outstanding:</strong> ZMW {balance.toLocaleString()}</p>
      </div>

      <h2 className="text-sm mt-4 font-semibold">Choose Payment Method</h2>

      <div className="grid grid-cols-1 gap-3">
        <Link href={`/pay/${invoice._id}/momo`}>
          <Button className="w-full py-3">Pay with MTN MoMo</Button>
        </Link>

        <Link href={`/pay/${invoice._id}/airtel`}>
          <Button className="w-full py-3">Pay with Airtel Money</Button>
        </Link>

        <Link href={`/pay/${invoice._id}/bank`}>
          <Button variant="outline" className="w-full py-3">
            Bank Transfer
          </Button>
        </Link>

        <Link href={`/pay/${invoice._id}/cash`}>
          <Button variant="outline" className="w-full py-3">
            Pay Cash (Record Payment)
          </Button>
        </Link>
      </div>
    </div>
  );
}
