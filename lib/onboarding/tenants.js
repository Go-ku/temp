"use server";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/db/mongoose";
import { sendTenantInviteEmail } from "@/lib/notifications/tenantInviteEmail";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import Tenant from "@/models/Tenant";
import User from "@/models/User";

export async function onboardTenant(tenantId) {
  await connectToDatabase();

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  // If tenant already has a linked user account → skip onboarding
  if (tenant.user) return { alreadyExists: true };

  // 1. Generate a secure temporary password
  const tempPassword = crypto.randomBytes(6).toString("hex");
  const hashed = await bcrypt.hash(tempPassword, 10);

  // 2. Create the user account
  const user = await User.create({
    name: tenant.fullName,
    email: tenant.email,
    phone: tenant.phone,
    password: hashed,
    roles: ["tenant"],
  });

  // 3. Link tenant to the user
  tenant.user = user._id;
  await tenant.save();

  // 4. Send onboarding email with login link
  await sendTenantInviteEmail({
    email: tenant.email,
    fullName: tenant.fullName,
    tempPassword,
  });

  // Optional WhatsApp onboarding message
  if (tenant.phone) {
    const whatsappMessage =
      `Welcome to Nyumba, ${tenant.fullName}!\n\n` +
      `Your tenant account has been created.\n\n` +
      `Email: ${tenant.email}\n` +
      `Temporary Password: ${tempPassword}\n\n` +
      `Login here: ${process.env.NEXT_PUBLIC_APP_URL}/sign-in\n\n` +
      `You can now view your lease, download invoices, and make rent payments.`;

    await sendWhatsAppMessage(tenant.phone, whatsappMessage);
  }

  revalidatePath(`/tenants/${tenantId}`);

  return {
    success: true,
    userId: user._id,
    email: tenant.email,
  };
}

export async function completeTenantOnboarding(userId, data) {
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const tenant = await Tenant.findOne({ user: user._id });
  if (!tenant) throw new Error("Tenant not found");

  // Update user basics
  user.name = data.fullName;
  user.phone = data.phone;
  user.hasCompletedOnboarding = true;
  await user.save();

  // Update tenant details
  tenant.fullName = data.fullName;
  tenant.phone = data.phone;
  tenant.email = data.email;
  tenant.emergencyContactName = data.emergencyContactName;
  tenant.emergencyContactPhone = data.emergencyContactPhone;
  await tenant.save();

  revalidatePath("/dashboard/tenant");

  return { success: true };
}
