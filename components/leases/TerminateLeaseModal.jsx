"use client";

import { useState } from "react";
import { terminateLease } from "@/app/(actions)/leases";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TerminateLeaseModal({ leaseId }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    const result = await terminateLease(leaseId, formData);
    if (result?.success) setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Terminate Lease
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terminate Lease</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm">Termination Date</label>
              <Input name="terminationDate" type="date" required />
            </div>

            <div className="space-y-1">
              <label className="text-sm">Reason</label>
              <Textarea name="reason" required placeholder="e.g. tenant moved out" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Confirm Termination
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
