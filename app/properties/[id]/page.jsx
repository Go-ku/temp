import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import { deleteProperty } from "@/app/(actions)/properties";
import { Button } from "@/components/ui/button";
import Lease from "@/models/Lease";
export const dynamic = "force-dynamic";

async function deleteAction(id) {
  "use server";
  await deleteProperty(id);
  redirect("/properties");
}

export default async function PropertyDetailsPage({ params }) {
  const { id } = (await params) || {};
  if (!id) return <div className="p-4">Property not found.</div>;

  await connectToDatabase();
  const property = await Property.findById(id)
    .populate("landlord")
    .populate("managers")
    .lean();

  if (!property) return <div className="p-4">Property not found.</div>;
  const plainProperty = JSON.parse(JSON.stringify(property));
  const leases = await Lease.find({ property: id }).lean();
  const hasActiveLease = leases.some((l) => l.status === "active");
  const propertyId = plainProperty._id;
  console.log("Property ID:", propertyId);
  const location = [
    property.address?.area,
    property.address?.town,
    property.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{property.title}</h1>
          <p className="text-sm text-gray-600">{property.code || ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/properties/${property._id}/leases`}>
            <Button size="sm" variant="outline">
              Manage Leases
            </Button>
          </Link>
          <Link href={`/properties/${propertyId}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <form action={deleteAction.bind(null, propertyId)}>
            <Button variant="destructive">Delete</Button>
          </form>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <div>
          <strong>Landlord:</strong>{" "}
          {property.landlord?.name || property.landlord?.email || "—"}
        </div>
        <div>
          <strong>Managers:</strong>{" "}
          {property.managers?.length
            ? property.managers.map((m) => m.name || m.email).join(", ")
            : "—"}
        </div>
        <div>
          <strong>Location:</strong> {location || "—"}
        </div>
        <div>
          <strong>Default Rent:</strong>{" "}
          {property.defaultRentAmount != null
            ? `ZMW ${Number(property.defaultRentAmount).toLocaleString()}`
            : "—"}
        </div>
        <div>
          <strong>Type:</strong> {property.type}
        </div>
        <div>
          <strong>Status:</strong> {property.isActive ? "Active" : "Inactive"}
        </div>
        {property.description && (
          <div>
            <strong>Description:</strong>
            <p className="text-sm text-gray-700 mt-1">{property.description}</p>
          </div>
        )}
        {property.notes && (
          <div>
            <strong>Notes:</strong>
            <p className="text-sm text-gray-700 mt-1">{property.notes}</p>
          </div>
        )}
      </div>
      {!hasActiveLease && (
        <div className="p-4 border rounded-xl bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-1">Next Step</h3>
          <p className="text-sm text-blue-800 mb-3">
            This property does not have an active lease yet. Add a tenant and
            create a lease to start tracking rent.
          </p>

          <Link href={`/leases/new?propertyId=${propertyId}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Lease
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
