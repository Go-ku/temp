"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema } from "@/lib/validators/tenantSchema";
import { Input } from "@/components/ui/input";
import { createTenant } from "@/app/(actions)/tenants";

export default function TenantAddModal({ onTenantCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      idNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  async function handleSubmit(values) {
    setLoading(true);
    const result = await createTenant(values);
    setLoading(false);

    if (result?.success) {
      onTenantCreated(result.data);     // pass newly created tenant back to parent
      setOpen(false);
      form.reset();
    } else {
      console.error(result.errors);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={() => setOpen(true)}
      >
        + Add Tenant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            <div>
              <label className="text-sm">Full Name *</label>
              <Input {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-xs">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm">Email</label>
              <Input type="email" {...form.register("email")} />
            </div>

            <div>
              <label className="text-sm">Phone Number *</label>
              <Input {...form.register("phone")} />
            </div>

            <div>
              <label className="text-sm">NRC / Passport</label>
              <Input {...form.register("idNumber")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Emergency Contact</label>
                <Input {...form.register("emergencyContactName")} />
              </div>
              <div>
                <label className="text-sm">Emergency Phone</label>
                <Input {...form.register("emergencyContactPhone")} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
