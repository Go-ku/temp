"use client";

import { createColumnHelper } from "@tanstack/react-table";
import InvoiceStatusBadge from "./invoice-status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PayNowWrapper from "../payments/PayNowWrapper";

const columnHelper = createColumnHelper();

export const invoiceColumns = [
  columnHelper.accessor("reference", {
    header: "Invoice #",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("periodLabel", {
    header: "Period",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("tenant.fullName", {
    header: "Tenant",
    cell: (info) => info.getValue() || "-",
  }),

  columnHelper.accessor("property.title", {
    header: "Property",
    cell: (info) => info.getValue() || "-",
  }),

  columnHelper.accessor("amountDue", {
    header: "Amount Due",
    cell: (info) => {
      const val = info.getValue();
      return `ZMW ${Number(val || 0).toLocaleString()}`;
    },
  }),

  columnHelper.accessor("amountPaid", {
    header: "Paid",
    cell: (info) => {
      const val = info.getValue();
      return `ZMW ${Number(val || 0).toLocaleString()}`;
    },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <InvoiceStatusBadge status={info.getValue()} />,
  }),

  columnHelper.accessor("dueDate", {
    header: "Due Date",
    cell: (info) =>
      new Date(info.getValue()).toLocaleDateString("en-ZM", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  }),

  columnHelper.display({
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const invoice = row.original;

    const isPaid = invoice.status === "paid";
    const outstanding = Number(invoice.amountDue || 0) - Number(invoice.amountPaid || 0);

    return (
      <div className="flex items-center gap-2">
        <Link href={`/invoices/${invoice._id}`}>
          <Button variant="outline" size="sm">View</Button>
        </Link>

        {!isPaid && (
          <PayNowWrapper
              invoice={{
                _id: invoice._id,
                reference: invoice.reference,
                outstanding,
              }}
            />
        )}
        <Link href={`/invoices/${invoice._id}/pdf`} target="_blank">
            <Button size="sm" variant="outline">
              PDF
            </Button>
          </Link>
      </div>
    );
  },
}),

];
