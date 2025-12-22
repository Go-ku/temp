"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { Resend} from "resend";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";

// CREATE USER

const resend = new Resend(process.env.RESEND_API_KEY);
export async function createUser(data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
    await connectToDatabase();
  try {
    const user = await User.create(data);
    const safeUser = JSON.parse(JSON.stringify(user));
    return { success: true, data: safeUser };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

// GET USER
export async function getUser(id) {
  await connectToDatabase();
  const user = await User.findById(id);
  return { success: !!user, data: user };
}

// UPDATE USER
export async function updateUser(id, data) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
    await connectToDatabase();
  try {
    const updated = await User.findByIdAndUpdate(id, data, { new: true });
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, errors: err.errors || err.message };
  }
}

// DELETE USER
export async function deleteUser(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
    await connectToDatabase();
  await User.findByIdAndDelete(id);
  return { success: true };
}

// LIST USERS
export async function listUsers(query = {}) {
  await connectToDatabase();
  const users = await User.find(query).sort({ createdAt: -1 });
  return { success: true, data: users };
}

export async function changePassword(prevState, formData) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const user = await User.findById(session.user.id).select("+password");
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const oldPassword = formData.get("oldPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return { success: false, error: "Old password is incorrect" };
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  await user.save();

  // OPTIONAL: Force logout to refresh session
  redirect("/sign-in?passwordUpdated=true");
}

export async function sendPasswordResetLink(email) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    // Prevent email enumeration attacks
    return { success: true };
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min
  await user.save();

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  // Send the email
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password:</p>
      <p><a href="${url}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
  });
  // After the email sending block:
if (user.phone) {
  const msg =
    `Nyumba Password Reset Request:\n\n` +
    `We received a request to reset your password.\n\n` +
    `Use the link below:\n${url}\n\n` +
    `This link expires in 15 minutes.`;

  await sendWhatsAppMessage(user.phone, msg);
}
  return { success: true };
}

export async function resetPassword(token, newPassword) {
  await connectToDatabase();

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired reset link" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return { success: true };
}