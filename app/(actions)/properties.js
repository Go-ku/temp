"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function createProperty(data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    const property = await Property.create(data);
    revalidatePath("/properties");
    redirect(`/properties/${property._id}`);
    
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function getProperty(id) {
  await connectToDatabase();
  const property = await Property.findById(id)
    .populate("landlord")
    .populate("managers");
  return { success: !!property, data: property };
}

export async function updateProperty(id, data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    const updated = await Property.findByIdAndUpdate(id, data, { new: true });
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function deleteProperty(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  await Property.findByIdAndDelete(id);
  return { success: true };
}

export async function listProperties(query = {}) {
  await connectToDatabase();
  const properties = await Property.find(query)
    .populate("landlord")
    .populate("managers")
    .sort({ createdAt: -1 });
  return { success: true, data: properties };
}
