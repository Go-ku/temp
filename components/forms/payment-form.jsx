// components/forms/payment-form.jsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema } from "@/lib/validators/paymentSchema";
import { Button } from "@/components/ui/button";
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";

const METHODS = [
  { key: "cash", label: "Cash" },
  { key: "bank_transfer", label: "Bank Transfer" },
  { key: "mtn_momo", label: "MTN MoMo" },
  { key: "airtel_money", label: "Airtel Money" },
  { key: "card", label: "Card" },
  { key: "cheque", label: "Cheque" },
  { key: "other", label: "Other" },
];

export default function PaymentForm({ leases = [], onSubmit }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      lease: "",
      amount: "",
      method: "",
      receiptNumber: "",
      datePaid: new Date().toISOString().slice(0, 10),
      externalRef: "",
      notes: "",
    },
  });

  const handleSubmit = (values) => {
    startTransition(async () => {
      const payload = {
        lease: values.lease,
        amount: Number(values.amount),
        method: values.method,
        receiptNumber: values.receiptNumber,
        datePaid: new Date(values.datePaid),
        externalRef: values.externalRef || undefined,
        notes: values.notes || undefined,
      };

      const result = await onSubmit(payload);
      if (result?.success) form.reset();
      else console.error(result.errors);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Record Payment</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="lease"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leases.map((l) => (
                      <SelectItem key={l._id} value={l._id}>
                        {l.tenant?.fullName} — {l.property?.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (ZMW) *</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datePaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Paid *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m.key} value={m.key}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiptNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt Number *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. RCP-000123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="externalRef"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Reference</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MoMo / Airtel ref, bank ref…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Optional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? "Saving..." : "Record Payment"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
