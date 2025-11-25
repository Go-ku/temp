// models/Invoice.js
import mongoose, { Schema} from "mongoose";
import Lease from "./Lease.js";
import Tenant from "./Tenant.js";
import Property from "./Property.js";

const INVOICE_STATUS_VALUES = ["pending", "partially_paid", "paid", "overdue"];

const InvoiceSchema = new Schema(
  {
    lease: {
      type: Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
      index: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    // e.g. 2025-03 for monthly rent
    periodLabel: {
      type: String,
      required: true,
      index: true,
    },

    issueDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ZMW",
    },

    status: {
      type: String,
      enum: INVOICE_STATUS_VALUES,
      default: "pending",
      index: true,
    },

    // Track how much has been paid against this invoice
    amountPaid: {
      type: Number,
      default: 0,
    },

    // For reference
    reference: {
      type: String,
      unique: true,
      required: true,
    },

    notes: String,
  },
  { timestamps: true }
);

InvoiceSchema.index({ lease: 1, periodLabel: 1 }, { unique: true });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export default Invoice;
