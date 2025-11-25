"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUpPage() {
  const [error, setError] = useState("");
  const [role, setRole] = useState("tenant");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        roles: [role],
      }),
    });

    const data = await res.json();
    console.log("Response data:", data)
    if (!data.success) {
      setError(data.error);
    } else {
      window.location.href = "/sign-in";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg max-w-sm w-full space-y-4"
      >
        <h1 className="text-xl font-bold">Register</h1>

        {error && <p className="text-red-500">{error}</p>}

        <Input name="name" placeholder="Full Name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />

        <div className="space-y-1">
          <p className="text-sm font-medium">Role</p>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="landlord">Landlord</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full">Create Account</Button>
      </form>
    </div>
  );
}
