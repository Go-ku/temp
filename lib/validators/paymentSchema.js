// lib/validators/paymentSchema.js
import { z } from "zod";

export const paymentSchema = z.object({
  lease: z.string().min(1, "Lease is required"),
  amount: z.string().min(1, "Amount required"),
  method: z.string().min(1, "Payment method required"),
  receiptNumber: z.string().min(1, "Receipt number required"),
  datePaid: z.string().min(1, "Date required"),
  externalRef: z.string().optional(),
  notes: z.string().optional(),
});
