// lib/validators/leaseSchema.js
import { z } from "zod";

export const leaseSchema = z.object({
  property: z.string().min(1, "Property is required"),
  tenant: z.string().min(1, "Tenant is required"),
  landlord: z.string().min(1, "Landlord is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rentAmount: z.string().min(1, "Rent is required"),
  rentFrequency: z.string().min(1, "Frequency is required"),
  dueDay: z
    .string()
    .min(1, "Due day required")
    .transform((val) => Number(val)),
  depositAmount: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 0)),
});
