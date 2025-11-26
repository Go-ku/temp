import Link from "next/link";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/dashboard/SectionCard";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  await connectToDatabase();
  const properties = await Property.find({})
    .populate("landlord")
    .populate("managers")
    .sort({ createdAt: -1 })
    .lean();

  const rows = properties.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    landlord: p.landlord?.name || p.landlord?.email || "—",
    location: [p.address?.area, p.address?.town, p.address?.city]
      .filter(Boolean)
      .join(", "),
    rent:
      p.defaultRentAmount != null
        ? `ZMW ${Number(p.defaultRentAmount).toLocaleString()}`
        : "—",
    status: p.isActive ? "Active" : "Inactive",
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">Portfolio</p>
          <h1 className="text-2xl font-semibold">Properties</h1>
          <p className="text-sm text-gray-600">
            Manage units, landlords, and default rents.
          </p>
        </div>
        <Link href="/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      <SectionCard title="All Properties">
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 bg-gray-50 px-3 py-2 text-sm font-semibold">
            <span className="col-span-2">Title</span>
            <span>Landlord</span>
            <span>Location</span>
            <span>Default Rent</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-6 px-3 py-3 text-sm items-center"
              >
                <span className="col-span-2 font-medium">{row.title}</span>
                <span>{row.landlord}</span>
                <span className="text-gray-700">{row.location || "—"}</span>
                <span>{row.rent}</span>
                <div className="flex justify-end gap-2">
                  <Link href={`/properties/${row.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                  <Link href={`/properties/${row.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {rows.length === 0 && (
              <div className="p-4 text-sm text-gray-600">
                No properties yet.
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
