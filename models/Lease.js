// models/Lease.js
import mongoose, { Schema } from "mongoose";

const LEASE_STATUS_VALUES = ["pending", "active", "terminated", "expired"];
const RENT_FREQUENCY_VALUES = ["monthly", "quarterly", "yearly", "weekly"];

const LeaseSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaseRef: {
      type: String,
      unique: true,
      default: () =>
        `LEASE-${new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase()}`,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },

    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    rentCurrency: {
      type: String,
      default: "ZMW",
    },
    rentFrequency: {
      type: String,
      enum: RENT_FREQUENCY_VALUES,
      default: "monthly",
    },

    // Day of month rent is due (1–31)
    dueDay: {
      type: Number,
      min: 1,
      max: 31,
      required: true,
    },

    depositAmount: {
      type: Number,
      default: 0,
    },
    depositCurrency: {
      type: String,
      default: "ZMW",
    },
    depositHeld: {
      type: Boolean,
      default: true,
    },
    depositBalance: {
      type: Number,
      default: 0,
    },

    depositHistory: [
      {
        type: {
          type: String,
          enum: ["deduction", "refund"],
          required: true,
        },
        amount: Number,
        reason: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: LEASE_STATUS_VALUES,
      default: "pending",
      index: true,
    },

    terminationDate: Date,
    terminationReason: String,

    lastRentIncreaseDate: Date,
    nextReviewDate: Date,

    // For automation / auditing
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

LeaseSchema.index({ property: 1, tenant: 1, status: 1 });
LeaseSchema.index({ landlord: 1 });
LeaseSchema.index({ nextReviewDate: 1 });

// Guard against null leaseRef by populating if missing before save


const Lease = mongoose.models.Lease || mongoose.model("Lease", LeaseSchema);
export default Lease;
