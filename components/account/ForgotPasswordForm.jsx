"use client";

import { useState, useTransition } from "react";
import { sendPasswordResetLink } from "@/app/(actions)/passwordReset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await sendPasswordResetLink(email);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button className="w-full" disabled={isPending}>
            {isPending ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">
            If an account exists with that email, a reset link has been sent.
          </p>
        </div>
      )}
    </>
  );
}
