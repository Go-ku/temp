// components/forms/tenant-form.jsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema } from "@/lib/validators/tenantSchema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function TenantForm({ onSubmit }) {
  const [isPending, startTransition] = useTransition();

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

  const handleSubmit = (values) => {
    startTransition(async () => {
      const payload = { ...values };
      if (!payload.email) delete payload.email;

      const result = await onSubmit(payload);
      if (result?.success) {
        form.reset();
      } else {
        console.error(result?.errors);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Register Tenant</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Banda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="+260..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tenant@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NRC / Passport</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 123456/11/1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Relative / Friend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+260..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Tenant"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
