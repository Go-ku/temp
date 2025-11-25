// models/Payment.js
import mongoose, { Schema } from "mongoose";
import Tenant from "./Tenant.js";
import Invoice from "./Invoice.js";

const PAYMENT_METHOD_VALUES = [
  "cash",
  "bank_transfer",
  "mtn_momo",
  "airtel_money",
  "card",
  "cheque",
  "other",
];

const PAYMENT_STATUS_VALUES = [
  "pending",
  "successful",
  "failed",
  "reversed",
  "refunded",
];

const PaymentSchema = new Schema(
  {
    lease: {
      type: Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ZMW",
    },
    datePaid: {
      type: Date,
      required: true,
      default: Date.now,
    },

    method: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      required: true,
    },

    // For local mobile money / bank integration
    externalRef: {
      type: String, // MoMo transaction ID, bank ref, etc.
      index: true,
    },
    transactionId: {
      type: String, // gateway transaction id (from webhook)
      index: true,
    },

    receiptNumber: {
      type: String,
      required: true,
      unique: true, // unique enforces index; no separate index needed
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: "successful",
      index: true,
    },

    isDeposit: {
      type: Boolean,
      default: false,
    },

    // Period of rent this payment is covering (helpful for statements)
    periodStart: Date,
    periodEnd: Date,

    notes: {
      type: String,
      trim: true,
    },

    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },

    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // manager/admin who logged the payment
    },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "refunded", "failed"],
      default: "none",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
    },
    refundExternalRef: {
      type: String, // refund transaction id from MoMo / Airtel
    },
    receiptUrl: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

PaymentSchema.index({ datePaid: 1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;
