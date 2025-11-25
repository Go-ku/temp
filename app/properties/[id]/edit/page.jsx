import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import PropertyForm from "@/components/forms/property-form";
import { updateProperty } from "@/app/(actions)/properties";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }) {
  const { id } = await params || {};
  if (!id) return <div className="p-4">Property not found.</div>;

  await connectToDatabase();
  const [property, landlords] = await Promise.all([
    Property.findById(id).lean(),
    User.find({ roles: "landlord", isActive: true }).lean(),
  ]);

  if (!property) return <div className="p-4">Property not found.</div>;

  const safeProperty = JSON.parse(JSON.stringify(property));
  const safeLandlords = JSON.parse(JSON.stringify(landlords));

  async function handleUpdate(data) {
    "use server";
    return updateProperty(id, data);
  }

  return (
    <div className="p-4 sm:p-6">
      <PropertyForm
        landlords={safeLandlords}
        initialData={safeProperty}
        onSubmit={handleUpdate}
        submitLabel="Update Property"
        titleText="Edit Property"
        redirectTo={`/properties/${id}`}
      />
    </div>
  );
}
