"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PaymentForm from "@/components/forms/payment-form";

export default function AddPaymentModal({ leases = [], onSubmit, triggerLabel = "Add Payment" }) {
  const [open, setOpen] = useState(false);

  // Default to first lease for convenience (optional)
  const defaultLeaseId = useMemo(() => leases[0]?._id?.toString() || "", [leases]);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm
            leases={leases.map((l) => ({ ...l, _id: l._id?.toString?.() || l._id }))}
            onSubmit={async (payload) => {
              const res = await onSubmit(payload);
              if (res?.success) setOpen(false);
              return res;
            }}
            defaultLeaseId={defaultLeaseId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
