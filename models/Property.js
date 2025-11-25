// models/Property.js
import mongoose, { Schema } from "mongoose";

const PROPERTY_TYPE_VALUES = [
  "house",
  "apartment",
  "flat",
  "shop",
  "office",
  "warehouse",
  "land",
  "other",
];

const PropertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // e.g. "KBU-HSE-01"
    },
    type: {
      type: String,
      enum: PROPERTY_TYPE_VALUES,
      default: "house",
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      area: { type: String, trim: true }, // e.g. neighborhood / compound
      town: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
      country: { type: String, trim: true, default: "Zambia" },
      gps: { type: String, trim: true }, // optional GPS coords
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bedrooms: Number,
    bathrooms: Number,
    parkingSpots: Number,
    sizeSqm: Number,

    // Default financials (actual rent is on Lease, this is just default)
    defaultRentAmount: Number,
    defaultRentCurrency: {
      type: String,
      default: "ZMW",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        url: String,
        publicId: String, // for Cloudinary
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PropertySchema.index({ "address.town": 1, "address.area": 1 });
PropertySchema.index({ landlord: 1 });

const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);
export default Property;
