"use client";

import { useState, useTransition } from "react";
import { completeTenantOnboarding } from "@/app/(actions)/tenantOnboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TenantOnboardingWizard({ user, tenant }) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: tenant.fullName || user.name || "",
    email: tenant.email || user.email || "",
    phone: tenant.phone || user.phone || "",
    emergencyContactName: tenant.emergencyContactName || "",
    emergencyContactPhone: tenant.emergencyContactPhone || "",
  });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => s - 1);
  }

  function handleSubmit() {
    setError("");

    startTransition(async () => {
      const res = await completeTenantOnboarding(user._id.toString(), form);
      if (!res?.success) {
        setError("Failed to complete onboarding. Please try again.");
      } else {
        // Go to dashboard
        window.location.href = "/dashboard/tenant";
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Welcome, {form.fullName || "there"} 👋</h1>
        <p className="text-sm text-gray-600">
          Let’s quickly confirm your details so you can start using your tenant portal.
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Step 1 of 2 — Your Details</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Full Name</label>
            <Input
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
            <Input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+260..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={nextStep}>Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Step 2 of 2 — Emergency Contact</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Emergency Contact Name
            </label>
            <Input
              value={form.emergencyContactName}
              onChange={(e) => updateField("emergencyContactName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Emergency Contact Phone
            </label>
            <Input
              value={form.emergencyContactPhone}
              onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
              placeholder="+260..."
            />
          </div>

          <p className="text-xs text-gray-500">
            This will be used only in case of emergencies related to your tenancy.
          </p>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-between gap-2 pt-4">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving..." : "Finish Setup"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
