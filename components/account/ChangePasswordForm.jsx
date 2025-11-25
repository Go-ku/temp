"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/app/(actions)/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setError("");

    startTransition(async () => {
      const result = await changePassword(null, formData);

      if (result?.error) {
        setError(result.error);
      }
      // Success = redirect handled server-side
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium mb-1">Old Password</label>
        <Input type="password" name="oldPassword" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <Input type="password" name="newPassword" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <Input type="password" name="confirmPassword" required />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button disabled={isPending}>
        {isPending ? "Updating…" : "Change Password"}
      </Button>
    </form>
  );
}
