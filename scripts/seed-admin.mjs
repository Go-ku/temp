import bcrypt from "bcrypt";
import { connectToDatabase } from "../lib/db/mongoose.js";
import User from "../models/User.js";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!adminEmail || !adminPassword) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running.");
    process.exit(1);
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    if (!existing.roles?.includes("admin")) {
      existing.roles = Array.from(new Set([...(existing.roles || []), "admin"]));
      await existing.save();
      console.log(`Updated roles for ${adminEmail} to include admin.`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashed,
    roles: ["admin"],
    isActive: true,
  });

  console.log(`Admin user created: ${adminEmail}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
