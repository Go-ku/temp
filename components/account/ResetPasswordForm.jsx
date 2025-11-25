"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/app/(actions)/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordForm({ token }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const res = await resetPassword(token, newPassword);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error);
      }
    });
  }

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-700 text-sm">
          Password successfully reset! You can now sign in.
        </p>
        <Button className="w-full mt-4" asChild>
          <a href="/sign-in">Go to Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="password"
        placeholder="New Password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Confirm Password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button className="w-full" disabled={isPending}>
        {isPending ? "Updating…" : "Reset Password"}
      </Button>
    </form>
  );
}
