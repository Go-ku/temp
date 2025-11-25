// app/leases/new/page.jsx
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import User from "@/models/User";
import { createLease } from "@/app/(actions)/leases";
import LeaseForm from "@/components/forms/lease-form";

// Helper function to serialize data
function serializeData(data) {
  // Use JSON.parse(JSON.stringify(data)) to ensure deep serialization,
  // especially for Mongoose objects that contain ObjectIds or Dates.
  return JSON.parse(JSON.stringify(data));
}

export const dynamic = "force-dynamic";

export default async function NewLeasePage({searchParams}) {
  // Ensure searchParams is an object before accessing propertyId
  const propertyId = (await searchParams)?.propertyId; 
  
  await connectToDatabase();

  const [rawProperties, rawTenants, rawLandlords] = await Promise.all([
    Property.find({ isActive: true }).lean(),
    Tenant.find({ isActive: true }).lean(),
    User.find({ roles: "landlord", isActive: true }).lean(),
  ]);

  // 1. Serialize the data before passing it to the client component (LeaseForm)
  const properties = serializeData(rawProperties);
  const tenants = serializeData(rawTenants);
  const landlords = serializeData(rawLandlords);

  return (
    <div className="p-4 sm:p-6">
      <LeaseForm
        // 2. Pass the serialized, plain JSON data
        properties={properties}
        tenants={tenants}
        landlords={landlords}
        onSubmit={createLease}
        // defaultPropertyId is a simple string/number, so no special serialization is needed
        defaultPropertyId={propertyId} 
      />
    </div>
  );
}