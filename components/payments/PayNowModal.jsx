"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePaymentStatus from "@/hooks/usePaymentStatus";

export default function PayNowModal({ invoice, open, onOpenChange }) {
  const [method, setMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const status = usePaymentStatus(paymentId, 3000); // poll every 3 seconds
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function initiatePayment() {
    setLoading(true);
    setMessage("");

    let url = "";
    if (method === "momo") url = "/api/payments/momo/initiate";
    else if (method === "airtel") url = "/api/payments/airtel/initiate";
    else {
      setMessage("Please select a valid payment method.");
      setLoading(false);
      return;
    }

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        invoiceId: invoice._id,
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

  const isDone = status === "successful" || status === "failed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        
        <DialogHeader>
          <DialogTitle>Pay Invoice {invoice.reference}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Outstanding: <strong>ZMW {invoice.outstanding.toLocaleString()}</strong>
        </p>

        {!paymentId && (
          <>
            {/* Payment Methods */}
            <div className="space-y-2 mt-3">
              <p className="text-sm text-gray-500">Choose payment method:</p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={method === "momo" ? "default" : "outline"}
                  onClick={() => setMethod("momo")}
                >
                  MTN MoMo
                </Button>

                <Button
                  variant={method === "airtel" ? "default" : "outline"}
                  onClick={() => setMethod("airtel")}
                >
                  Airtel Money
                </Button>
              </div>
            </div>

            {/* Phone Input */}
            {(method === "momo" || method === "airtel") && (
              <div className="mt-4 space-y-1">
                <label className="text-xs text-gray-500">Phone Number</label>
                <Input
                  placeholder="096xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        {/* Status Section */}
        {paymentId && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50">
            {status === "pending" && (
              <p className="text-sm">Waiting for you to approve the payment…</p>
            )}

            {status === "successful" && (
              <p className="text-green-700 text-sm font-medium">
                Payment successful! 🎉
              </p>
            )}

            {status === "failed" && (
              <p className="text-red-700 text-sm font-medium">
                Payment failed ❌
              </p>
            )}
          </div>
        )}

        {message && (
          <p className="text-xs text-gray-500 mt-2">{message}</p>
        )}

        <DialogFooter>
          {!paymentId && (
            <Button
              onClick={initiatePayment}
              disabled={loading || !method || !phone}
            >
              {loading ? "Sending…" : "Pay Now"}
            </Button>
          )}

          {isDone && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
