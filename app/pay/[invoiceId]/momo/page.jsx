"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePaymentStatus from "@/hooks/usePaymentStatus";
import Link from "next/link";

export default function PayWithMomo({ params }) {
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const status = usePaymentStatus(paymentId);
  
  async function pay() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/payments/momo/initiate", {
      method: "POST",
      body: JSON.stringify({
        invoiceId: params.invoiceId,
        phone,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setPaymentId(data.paymentId);
      setMessage("Payment request sent. Approve on your phone.");
    } else {
      setMessage("Error: " + data.error);
    }
  }

  let statusMessage = "";
  if (paymentId) {
    if (status === "successful") statusMessage = "Payment successful! 🎉";
    if (status === "failed") statusMessage = "Payment failed ❌";
    if (status === "pending") statusMessage = "Waiting for approval…";
  }

  const isDone = status === "successful" || status === "failed";
  
  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">MTN MoMo Payment</h1>

      {!paymentId && (
        <>
          <Input
            placeholder="096xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Button onClick={pay} disabled={loading || !phone}>
            {loading ? "Sending…" : "Send Payment Request"}
          </Button>
        </>
      )}

      {paymentId && (
        <div className="p-3 border rounded-md bg-gray-50">
          <p className="font-medium">{statusMessage}</p>

          {status === "pending" && (
            <p className="text-xs text-gray-500 mt-1">
              Check your MTN popup and approve the transaction.
            </p>
          )}
        </div>
      )}

      {/* Auto show navigation options once done */}
      {isDone && (
        <>
          {status === "successful" && (
            <Link href={`/invoices/${params.invoiceId}`}>
              <Button className="w-full mt-2">View Invoice</Button>
            </Link>
          )}

          <Link href="/dashboard/tenant">
            <Button variant="outline" className="w-full mt-2">
              Back to Dashboard
            </Button>
          </Link>
        </>
      )}

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
