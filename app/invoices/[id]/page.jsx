import { connectToDatabase } from "@/lib/db/mongoose";
import Invoice from "@/models/Invoice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";
import PayNowWrapper from "@/components/payments/PayNowWrapper";
export default async function InvoiceDetailsPage({ params }) {
  await connectToDatabase();
  const { id } = await params || {};
  if (!id) return <div>Invoice not found</div>;

  const invoice = await Invoice.findById(id)
    .populate("tenant")
    .populate("property")
    .populate("lease")
    .lean();

  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="p-4 sm:p-6 space-y-3">
      <h1 className="text-xl font-semibold">Invoice {invoice.reference}</h1>

      <div className="p-4 border rounded-lg space-y-2">
        <p>
          <strong>Period:</strong> {invoice.periodLabel}
        </p>
        <p>
          <strong>Tenant:</strong> {invoice.tenant.fullName}
        </p>
        <p>
          {/* <strong>Property:</strong> {invoice.property.title} */}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <InvoiceStatusBadge status={invoice.status} />
        </p>

        <p>
          <strong>Amount Due:</strong> ZMW {invoice.amountDue}
        </p>
        <p>
          <strong>Amount Paid:</strong> ZMW {invoice.amountPaid}
        </p>
        <p>
          <strong>Due Date:</strong> {new Date(invoice.dueDate).toDateString()}
        </p>
      </div>
      {invoice.status !== "paid" && (
        <PayNowWrapper
          invoice={{
            _id: invoice._id,
            reference: invoice.reference,
            outstanding: invoice.amountDue - invoice.amountPaid,
          }}
        />
      )}

      <Link href={`/invoices/${invoice._id}/pdf`} target="_blank">
        <Button>Download PDF</Button>
      </Link>
    </div>
  );
}
