// components/forms/property-form.jsx
"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema } from "@/lib/validators/propertySchema";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
  "house",
  "apartment",
  "flat",
  "shop",
  "office",
  "warehouse",
  "land",
  "other",
];

export default function PropertyForm({
  landlords = [],
  onSubmit,
  initialData = null,
  submitLabel = "Save Property",
  titleText = "Add Property",
  redirectTo,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaults = useMemo(
    () => ({
      title: initialData?.title || "",
      code: initialData?.code || "",
      type: initialData?.type || "house",
      description: initialData?.description || "",
      landlord:
        initialData?.landlord?._id?.toString() ||
        initialData?.landlord?.toString() ||
        "",
      area: initialData?.address?.area || "",
      town: initialData?.address?.town || "",
      city: initialData?.address?.city || "",
      province: initialData?.address?.province || "",
      country: initialData?.address?.country || "Zambia",
      defaultRentAmount:
        initialData?.defaultRentAmount != null
          ? String(initialData.defaultRentAmount)
          : "",
    }),
    [initialData]
  );

  const form = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  const handleSubmit = (values) => {
    startTransition(async () => {
      const payload = {
        title: values.title,
        code: values.code || undefined,
        type: values.type,
        description: values.description || undefined,
        landlord: values.landlord,
        address: {
          area: values.area || undefined,
          town: values.town || undefined,
          city: values.city || undefined,
          province: values.province || undefined,
          country: values.country || "Zambia",
        },
        defaultRentAmount: values.defaultRentAmount
          ? Number(values.defaultRentAmount)
          : undefined,
      };

      const result = await onSubmit(payload);

      if (result?.success) {
        if (redirectTo) {
          router.push(redirectTo);
          return;
        }
        form.reset(defaults);
        // you could also show a toast here
      } else {
        console.error(result?.errors);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">{titleText}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="3-bedroom house in Kalumbila" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Property Code</FormLabel>
                  <FormControl>
                    <Input placeholder="KBU-HSE-01" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Internal reference (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
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

          {/* Address - mobile-first stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input placeholder="Estate / Compound" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town</FormLabel>
                  <FormControl>
                    <Input placeholder="Kalumbila" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Solwezi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <FormControl>
                    <Input placeholder="North-Western" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="defaultRentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Rent (ZMW)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="1" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Used as a template when creating leases.
                </FormDescription>
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
                  <Textarea
                    rows={3}
                    placeholder="Short description of the property"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}
