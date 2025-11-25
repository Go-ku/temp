// models/MaintenanceRequest.js
import mongoose, { Schema} from "mongoose";

const MAINTENANCE_STATUS_VALUES = [
  "new",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

const MAINTENANCE_PRIORITY_VALUES = ["low", "medium", "high", "urgent"];

const MAINTENANCE_CATEGORY_VALUES = [
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

const MaintenanceRequestSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    lease: {
      type: Schema.Types.ObjectId,
      ref: "Lease",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: MAINTENANCE_CATEGORY_VALUES,
      default: "general",
    },

    priority: {
      type: String,
      enum: MAINTENANCE_PRIORITY_VALUES,
      default: "medium",
      index: true,
    },

    status: {
      type: String,
      enum: MAINTENANCE_STATUS_VALUES,
      default: "new",
      index: true,
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // tenant or manager who logged it
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User", // maintenance staff or manager
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completedAt: {
      type: Date,
    },

    estimatedCost: {
      type: Number,
      min: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
    },

    accessNotes: {
      type: String,
      trim: true,
    },
    internalNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

MaintenanceRequestSchema.index({ property: 1, status: 1 });
MaintenanceRequestSchema.index({ requestedAt: 1 });

const MaintenanceRequest =
  mongoose.models.MaintenanceRequest || mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);

export default MaintenanceRequest;
