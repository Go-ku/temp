// lib/validators/propertySchema.js
import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  landlord: z.string().min(1, "Landlord is required"),
  area: z.string().optional(),
  town: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional().default("Zambia"),
  defaultRentAmount: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});
