"use server";

import { onboardTenant as onboardTenantImpl, completeTenantOnboarding as completeTenantOnboardingImpl } from "@/lib/onboarding/tenants";

export async function onboardTenant(tenantId) {
  return onboardTenantImpl(tenantId);
}

export async function completeTenantOnboarding(userId, data) {
  return completeTenantOnboardingImpl(userId, data);
}
