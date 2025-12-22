"use client";

import { useState } from "react";
import {DataTable} from "../data-table";// your reusable TanStack table

export default function PaymentsTable({ data }) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((payment) => {
    const term = search.toLowerCase();

    return (
      payment.receiptNumber?.toLowerCase().includes(term) ||
      payment.tenant?.fullName?.toLowerCase().includes(term) ||
      payment.property?.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search payments..."
        className="w-full border rounded-md px-3 py-2 text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        data={filtered}
        columns={require("./payments-columns").paymentColumns}
      />
    </div>
  );
}
