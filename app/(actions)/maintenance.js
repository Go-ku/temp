"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import MaintenanceRequest from "@/models/MaintenanceRequest";

export async function createMaintenanceRequest(data) {
    const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  try {
    const request = await MaintenanceRequest.create(data);
    return { success: true, data: request };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function updateMaintenanceStatus(id, status) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
    await connectToDatabase();
  try {
    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function assignMaintenance(id, userId) {
  await connectToDatabase();
  try {
    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id,
      { assignedTo: userId },
      { new: true }
    );
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

export async function listMaintenanceRequests(query = {}) {
  await connectToDatabase();
  const tasks = await MaintenanceRequest.find(query)
    .populate("property")
    .populate("lease")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });

  return { success: true, data: tasks };
}
