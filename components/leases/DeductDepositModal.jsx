"use client";

import { useState } from "react";
import { deductDeposit } from "@/app/(actions)/depositActions";
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

export default function DeductDepositModal({ leaseId }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    const res = await deductDeposit(leaseId, formData);
    if (res.success) setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Deduct Deposit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deduct From Deposit</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm">Amount (ZMW)</label>
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
              <Button type="submit">Confirm Deduction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
