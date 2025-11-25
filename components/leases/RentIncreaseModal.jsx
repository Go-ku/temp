"use client";

import { useState } from "react";
import { increaseLeaseRent } from "@/app/(actions)/leases";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function RentIncreaseModal({ leaseId }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("percent");
  const [amount, setAmount] = useState("");

  async function handleSubmit(formData) {
    const result = await increaseLeaseRent(leaseId, formData);
    if (result?.success) setOpen(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Increase Rent
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Increase Rent</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm">Increase Type</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (ZMW)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm">
                {type === "percent" ? "Percent (%)" : "New Rent (ZMW)"}
              </label>
              <Input
                name="amount"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Apply Increase</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
