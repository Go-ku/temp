"use client";

import { useState } from "react";
import { refundDeposit } from "@/app/(actions)/depositActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RefundDepositModal({ leaseId }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    const res = await refundDeposit(leaseId, formData);
    if (res.success) setOpen(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Refund Deposit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Deposit</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm">Amount to Refund (ZMW)</label>
              <Input name="amount" type="number" required />
            </div>

            <div>
              <label className="text-sm">Reason</label>
              <Textarea name="reason" required />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Process Refund</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
