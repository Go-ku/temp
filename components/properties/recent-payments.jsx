"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddPaymentModal from "@/components/properties/add-payment-modal";

function PaymentModal({ payment, onOpenChange }) {
  if (!payment) return null;

  return (
    <Dialog open={!!payment} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Receipt {payment.receiptNumber || "—"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Status</span>
            <span className="capitalize">{payment.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Date</span>
            <span>
              {payment.datePaid
                ? new Date(payment.datePaid).toLocaleDateString("en-ZM")
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-semibold">
              ZMW {Number(payment.amount || 0).toLocaleString()}
            </span>
          </div>
          {payment.method && (
            <div className="flex justify-between">
              <span>Method</span>
              <span className="capitalize">{payment.method}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RecentPayments({
  payments = [],
  propertyId,
  leases = [],
  onCreatePayment,
}) {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const displayed = payments.slice(0, 5);

  return (
    <div className="shadow-sm border rounded-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Recent Payments</p>
          <p className="text-xs text-gray-500">
            Latest transactions for this property.
          </p>
        </div>
        <AddPaymentModal
          leases={leases}
          onSubmit={onCreatePayment}
          triggerLabel="Add Payment"
        />
      </div>

      <div className="p-4 space-y-3">
        {payments.length === 0 ? (
          <p className="text-sm text-gray-600">No payments yet.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-2 lg:hidden">
              {displayed.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setSelectedPayment(p)}
                  className="w-full rounded-md border border-slate-200 p-3 text-left text-sm shadow-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {p.receiptNumber || "Receipt"}
                    </span>
                    <span className="capitalize text-gray-600">{p.status}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-gray-700">
                    <span>
                      {p.datePaid
                        ? new Date(p.datePaid).toLocaleDateString("en-ZM")
                        : "—"}
                    </span>
                    <span className="font-semibold">
                      ZMW {Number(p.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.map((p) => (
                    <TableRow
                      key={p._id}
                      className="cursor-pointer"
                      onClick={() => setSelectedPayment(p)}>
                      <TableCell>{p.receiptNumber || "—"}</TableCell>
                      <TableCell>
                        {p.datePaid
                          ? new Date(p.datePaid).toLocaleDateString("en-ZM")
                          : "—"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ZMW {Number(p.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">{p.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <PaymentModal payment={selectedPayment} onOpenChange={setSelectedPayment} />
    </div>
  );
}
