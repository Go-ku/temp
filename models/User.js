// models/User.js
import mongoose, { Schema } from "mongoose";

const ROLE_VALUES = ["admin", "landlord", "manager", "maintenance", "tenant"];

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // allow users without email (e.g. imported records)
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetPasswordToken: {
  type: String,
  default: null,
},
resetPasswordExpires: {
  type: Date,
  default: null,
},
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    roles: {
      type: [String],
      enum: ROLE_VALUES,
      default: ["tenant"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional linkage to external auth provider (e.g. Clerk, NextAuth)
    authProviderId: {
      type: String,
      index: true,
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

UserSchema.index({ phone: 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
