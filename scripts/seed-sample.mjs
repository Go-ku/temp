// scripts/seed-sample.mjs
// Clears key collections and seeds sample data for quick demos.
import bcrypt from "bcrypt";
import { connectToDatabase } from "../lib/db/mongoose.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Property from "../models/Property.js";
import Lease from "../models/Lease.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";

async function main() {
  const uri = "mongodb+srv://zmapp:xNzXLJ1sk0pvGmar@real-estate-cluster.eexh1op.mongodb.net/?appName=real-estate-cluster/nsaka&retryWrites=true&w=majority"
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env.local first.");
    process.exit(1);
  }

  await connectToDatabase();

  console.log("Clearing collections...");
  await Promise.all([
    User.deleteMany({}),
    Tenant.deleteMany({}),
    Property.deleteMany({}),
    Lease.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  console.log("Seeding users...");
  const [admin, landlordUser, tenantUser] = await Promise.all([
    User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("Password123!", 10),
      roles: ["admin"],
    }),
    User.create({
      name: "Landlord Lucy",
      email: "landlord@example.com",
      password: await bcrypt.hash("Password123!", 10),
      roles: ["landlord"],
    }),
    User.create({
      name: "Tenant Tom",
      email: "tenant@example.com",
      password: await bcrypt.hash("Password123!", 10),
      roles: ["tenant"],
    }),
  ]);

  console.log("Seeding tenant profile...");
  const tenantProfile = await Tenant.create({
    fullName: "Tenant Tom",
    email: "tenant@example.com",
    phone: "+260971234567",
    user: tenantUser._id,
  });

  console.log("Seeding property...");
  const property = await Property.create({
    title: "3 Bedroom House - Kalumbila",
    code: "KBU-HSE-01",
    type: "house",
    description: "Spacious 3-bedroom with yard and parking.",
    landlord: landlordUser._id,
    address: {
      area: "Kalumbila Estates",
      town: "Kalumbila",
      city: "Solwezi",
      province: "North-Western",
      country: "Zambia",
    },
    defaultRentAmount: 8500,
    isActive: true,
  });

  console.log("Seeding lease...");
  const today = new Date();
  const leaseStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const leaseEnd = new Date(today.getFullYear() + 1, today.getMonth(), 1);

  const lease = await Lease.create({
    tenant: tenantProfile._id,
    property: property._id,
    landlord: landlordUser._id,
    rentAmount: 8500,
    rentCurrency: "ZMW",
    rentFrequency: "monthly",
    dueDay: 5,
    startDate: leaseStart,
    endDate: leaseEnd,
    status: "active",
  });

  console.log("Seeding invoice...");
  const invoice = await Invoice.create({
    lease: lease._id,
    tenant: tenantProfile._id,
    property: property._id,
    landlord: landlordUser._id,
    periodLabel: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
    issueDate: leaseStart,
    dueDate: new Date(today.getFullYear(), today.getMonth(), 5),
    amountDue: 8500,
    amountPaid: 0,
    currency: "ZMW",
    status: "pending",
    reference: `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  });

  console.log("Seeding payment...");
  const payment = await Payment.create({
    lease: lease._id,
    property: property._id,
    tenant: tenantProfile._id,
    amount: 5000,
    currency: "ZMW",
    datePaid: new Date(),
    method: "cash",
    receiptNumber: `RCPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: "successful",
  });

  // Update invoice with paid amount
  invoice.amountPaid = payment.amount;
  invoice.status = "partially_paid";
  await invoice.save();

  console.log("Seed complete.");
  console.log("Logins:");
  console.log("  Admin:    admin@example.com / Password123!");
  console.log("  Landlord: landlord@example.com / Password123!");
  console.log("  Tenant:   tenant@example.com / Password123!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
