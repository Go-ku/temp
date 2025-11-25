// lib/validators/maintenanceSchema.js
import { z } from "zod";

export const maintenanceSchema = z.object({
  property: z.string().min(1, "Property required"),
  lease: z.string().optional(),
  title: z.string().min(1, "Short title required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category required"),
  priority: z.string().min(1, "Priority required"),
  estimatedCost: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
});
