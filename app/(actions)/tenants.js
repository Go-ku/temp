"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import Tenant from "@/models/Tenant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { onboardTenant } from "@/lib/onboarding/tenants";

export async function createTenant(data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    const tenant = await Tenant.create(data);
    await onboardTenant(tenant._id);
    return { success: true, data: tenant };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function getTenant(id) {
  await connectToDatabase();
  const tenant = await Tenant.findById(id).populate("user");
  return { success: !!tenant, data: tenant };
}

export async function updateTenant(id, data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    const updated = await Tenant.findByIdAndUpdate(id, data, { new: true });
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function deleteTenant(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  await Tenant.findByIdAndDelete(id);
  return { success: true };
}

export async function listTenants(query = {}) {
  await connectToDatabase();
  const tenants = await Tenant.find(query)
    .populate("user")
    .sort({ createdAt: -1 });
  return { success: true, data: tenants };
}
