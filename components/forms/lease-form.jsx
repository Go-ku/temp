// components/forms/lease-form.jsx
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseSchema } from "@/lib/validators/leaseSchema";
import TenantAddModal from "../tenants/TenantAddModal";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const FREQUENCIES = ["monthly", "quarterly", "yearly", "weekly"];

export default function LeaseForm({
  properties,
  tenants,
  landlords,
  onSubmit,
  defaultPropertyId,
}) {
  const [isPending, startTransition] = useTransition();
  const [localTenants, setLocalTenants] = useState(tenants);
  function handleTenantCreated(newTenant) {
    setLocalTenants((prev) => [...prev, newTenant]);
    form.setValue("tenant", newTenant._id); // auto-select new tenant
  }

  const matchingProperty = properties.find(
    (property) => property._id === defaultPropertyId
  );
  const defaultPropertyValue = matchingProperty ? matchingProperty._id : "";
  const form = useForm({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      property: defaultPropertyValue,
      tenant: "",
      landlord: "",
      startDate: "",
      endDate: "",
      rentAmount: "",
      rentFrequency: "monthly",
      dueDay: "1",
      depositAmount: "",
    },
  });

  const handleSubmit = (values) => {
    startTransition(async () => {
      const payload = {
        property: values.property,
        tenant: values.tenant,
        landlord: values.landlord,
        startDate: new Date(values.startDate),
        endDate: values.endDate ? new Date(values.endDate) : undefined,
        rentAmount: Number(values.rentAmount),
        rentCurrency: "ZMW",
        rentFrequency: values.rentFrequency,
        dueDay: Number(values.dueDay),
        depositAmount: values.depositAmount ? Number(values.depositAmount) : 0,
        depositCurrency: "ZMW",
      };

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
      <h1 className="text-xl font-semibold">Create Lease</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="property"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
            name="tenant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant *</FormLabel>
                <div className="flex items-center gap-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {localTenants.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Add Tenant button */}
                  <TenantAddModal onTenantCreated={handleTenantCreated} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="landlord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Landlord *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select landlord" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {landlords.map((l) => (
                      <SelectItem key={l._id} value={l._id}>
                        {l.name || l.email || l.phone}
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
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent (ZMW) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rentFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Day *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depositAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit (ZMW)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="1" {...field} />
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
            {isPending ? "Saving..." : "Save Lease"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
