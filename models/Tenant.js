// models/Tenant.js
import mongoose, { Schema } from "mongoose";

const TenantSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    idNumber: {
      type: String, // NRC / Passport
      trim: true,
    },

    // Optional link to app user account
    user: {
  type: Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },

    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TenantSchema.index({ fullName: "text", email: 1, phone: 1 });

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
export default Tenant;
