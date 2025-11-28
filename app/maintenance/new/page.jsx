// app/maintenance/new/page.jsx
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import Lease from "@/models/Lease";
import { createMaintenanceRequest } from "@/app/(actions)/maintenance";
import MaintenanceForm from "@/components/forms/maintenance-form";
import SectionCard from "@/components/dashboard/SectionCard";

export const dynamic = "force-dynamic";

export default async function NewMaintenancePage() {
  await connectToDatabase();

  const [properties, leases] = await Promise.all([
    Property.find({ isActive: true }).lean(),
    Lease.find({})
      .populate("property")
      .populate("tenant")
      .lean(),
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">Maintenance</p>
        <h1 className="text-2xl font-semibold">Log Maintenance Request</h1>
        <p className="text-sm text-gray-600">
          Capture issues and assign them to a property or lease.
        </p>
      </div>

      <SectionCard title="Request Details">
        <MaintenanceForm
          properties={properties}
          leases={leases}
          onSubmit={createMaintenanceRequest}
        />
      </SectionCard>
    </div>
  );
}
