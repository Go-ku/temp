"use client";

import { useState } from "react";
import { renewLease } from "@/app/(actions)/leases";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RenewLeaseModal({ lease }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    const res = await renewLease(lease._id, formData);
    if (res?.success) {
      setOpen(false);
      window.location.href = `/leases/${res.leaseId}`;
    }
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Renew Lease
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Lease</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm">Renewal Type</label>
              <select name="renewalType" className="input w-full">
                <option value="extend">Extend Existing Lease</option>
                <option value="new">Create New Lease</option>
              </select>
            </div>

            <div>
              <label className="text-sm">New Rent (ZMW)</label>
              <Input
                type="number"
                name="rentAmount"
                defaultValue={lease.rentAmount}
                required
              />
            </div>

            <div>
              <label className="text-sm">New Start Date</label>
              <Input
                type="date"
                name="startDate"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="text-sm">New End Date (Optional)</label>
              <Input type="date" name="endDate" />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Renew Lease</Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
