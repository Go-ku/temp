// app/properties/new/page.jsx
import { connectToDatabase } from "@/lib/db/mongoose";
import User from "@/models/User";
import { createProperty } from "@/app/(actions)/properties";
import PropertyForm from "@/components/forms/property-form";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  await connectToDatabase();
  const landlords = await User.find({ roles: "landlord", isActive: true }).lean();
  const safeLandlords = JSON.parse(JSON.stringify(landlords));

  return (
    <div className="p-4 sm:p-6">
      <PropertyForm
        landlords={safeLandlords}
        onSubmit={createProperty}
        redirectTo="/properties"
      />
    </div>
  );
}
