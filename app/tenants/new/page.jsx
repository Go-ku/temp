// app/tenants/new/page.jsx
import { createTenant } from "@/app/(actions)/tenants";
import TenantForm from "@/components/forms/tenant-form";

export default function NewTenantPage() {
  return (
    <div className="p-4 sm:p-6">
      <TenantForm onSubmit={createTenant} />
    </div>
  );
}
