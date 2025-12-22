"use client";
import { invoiceColumns } from "./invoice-columns";
import { DataTable } from "../data-table";

export default function InvoiceTable({ data }) {
  console.log("Invoices Data:", data);
  return (
    <DataTable data={data} columns={invoiceColumns} />
  );
}
