"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const passwordUpdated = searchParams?.get("passwordUpdated");

  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res.error) {
      setError(res.error);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {passwordUpdated && (
          <div className="p-3 rounded-md bg-green-100 text-green-800 text-sm">
            Your password was updated successfully. Please sign in.
          </div>
        )}
      <form
        onSubmit={handleLogin}
        className="p-6 border rounded-lg max-w-sm w-full space-y-4"
      >
        <h1 className="text-xl font-bold">Sign In</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required />

        <Button className="w-full">Sign In</Button>
      </form>
    </div>
  );
}
