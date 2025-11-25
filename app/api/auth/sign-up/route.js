// app/api/auth/sign-up/route.js
import bcrypt from "bcrypt";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, roles } = body;
    const errors = {};

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedName) errors.name = "Name is required";
    if (
      !trimmedEmail ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)
    ) {
      errors.email = "Valid email is required";
    }
    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(errors).length) {
      return Response.json({ success: false, errors }, { status: 400 });
    }

    console.log("Received sign-up data:", { ...body, password: "[redacted]" })
    const allowedRoles = ["tenant", "landlord", "manager", "maintenance"];
    const requestedRoles = Array.isArray(roles)
      ? roles
      : roles
        ? [roles]
        : [];
    const sanitizedRoles =
      requestedRoles.filter((role) => allowedRoles.includes(role)) ||
      [];
    const finalRoles = sanitizedRoles.length ? sanitizedRoles : ["tenant"];

    await connectToDatabase();
    console.log("Database connected");
    const existing = await User.findOne({ email: trimmedEmail });
    if (existing)
      return Response.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashed,
      roles: finalRoles,
    });
    console.log("User created:", user);
    return Response.json({ success: true, user });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
