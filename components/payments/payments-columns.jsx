"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const paymentColumns = [
  {
    accessorKey: "receiptNumber",
    header: "Receipt #",
  },
  {
    accessorKey: "tenant.fullName",
    header: "Tenant",
    cell: ({ row }) => row.original.tenant?.fullName || "-",
  },
  {
    accessorKey: "property.title",
    header: "Property",
    cell: ({ row }) => row.original.property?.title || "-",
  },
  {
    accessorKey: "amount",
    header: "Amount (ZMW)",
    cell: ({ row }) =>
      `ZMW ${row.original.amount?.toLocaleString()}`,
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) =>
      row.original.method
        ? row.original.method.replace("_", " ").toUpperCase()
        : "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const color =
        status === "successful"
          ? "bg-green-100 text-green-800"
          : status === "failed"
          ? "bg-red-100 text-red-800"
          : status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800";

      return (
        <Badge className={color} variant="outline">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "datePaid",
    header: "Date Paid",
    cell: ({ row }) =>
      new Date(row.original.datePaid).toLocaleDateString("en-ZM"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const p = row.original;

      return (
        <div className="flex items-center gap-2">
          <Link href={`/payments/${p._id}`}>
            <Button size="sm" variant="outline">View</Button>
          </Link>

          {p.status === "successful" && (
            <Link href={`/payments/${p._id}/receipt`} target="_blank">
              <Button size="sm" variant="outline">Receipt</Button>
            </Link>
          )}

          {p.invoice && (
            <Link
              href={`/invoices/${
                typeof p.invoice === "object" ? p.invoice?._id : p.invoice
              }`}>
              <Button size="sm" variant="outline">Invoice</Button>
            </Link>
          )}
        </div>
      );
    },
  },
];
