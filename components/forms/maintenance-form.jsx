// components/forms/maintenance-form.jsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceSchema } from "@/lib/validators/maintenanceSchema";

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

const CATEGORIES = [
  "plumbing",
  "electrical",
  "structural",
  "appliance",
  "security",
  "painting",
  "garden",
  "general",
  "other",
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function MaintenanceForm({
  properties = [],
  leases = [],
  onSubmit,
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      property: "",
      lease: "",
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      estimatedCost: "",
    },
  });

  const handleSubmit = (values) => {
    startTransition(async () => {
      const payload = {
        property: values.property,
        lease: values.lease || undefined,
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        priority: values.priority,
        estimatedCost: values.estimatedCost
          ? Number(values.estimatedCost)
          : undefined,
      };

      const result = await onSubmit(payload);
      if (result?.success) form.reset();
      else console.error(result.errors);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Log Maintenance Request</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="property"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.title}
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
            name="lease"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Lease (optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Burst pipe, faulty socket…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Additional details..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="estimatedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Cost (ZMW)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? "Saving..." : "Log Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
