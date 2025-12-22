import Link from "next/link";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import { Button } from "@/components/ui/button";
import {
  Plus,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import PropertiesTable from "@/components/properties/properties-table";
export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams,
}) {
  await connectToDatabase();
  const q = (await searchParams)?.q 
  const searchTerm = q ? q.toLowerCase() : null

  // Fetch data
  const properties = await Property.find({})
    .populate("landlord")
    .populate("managers")
    .sort({ createdAt: -1 })
    .lean();

  const rows = properties.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    landlord: p.landlord?.name || p.landlord?.email || "—",
    location: [p.address?.town, p.address?.city].filter(Boolean).join(", "),
    rent:
      p.defaultRentAmount != null
        ? `ZMW ${Number(p.defaultRentAmount).toLocaleString()}`
        : "—",
    status: p.isActive, // Pass boolean for dynamic badge styling
  }));

  const filteredRows = searchTerm
    ? rows.filter((row) => {
        const haystack = [
          row.title,
          row.landlord,
          row.location,
          row.rent,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchTerm);
      })
    : rows;

  const activeRows = filteredRows.filter((row) => row.status);
  const inactiveRows = filteredRows.filter((row) => !row.status);

  const tabViews = [
    { value: "all", label: "All", badge: filteredRows.length, data: filteredRows },
    { value: "active", label: "Active", badge: activeRows.length, data: activeRows },
    { value: "inactive", label: "Inactive", badge: inactiveRows.length, data: inactiveRows },
  ];

  return (
    <>
      <SiteHeader title="Properties" />
      <div className="p-4 sm:p-8 space-y-8 max-w-auto">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              🏢 Property Portfolio
            </h1>
            <p className="text-sm text-gray-500">
              Manage all units, associated landlords, and financial details.
            </p>
          </div>
          <Link href="/properties/new">
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" /> Add New Property
            </Button>
          </Link>
        </div>

        {/* PROPERTY TABLE CARD */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Managed Properties ({rows.length})</CardTitle>
            <CardDescription>
              A complete list of units in your portfolio.
            </CardDescription>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center" action="/properties">
              <Input
                name="q"
                placeholder="Search by property, landlord, or location"
                defaultValue={searchParams?.q || ""}
                className="sm:max-w-sm"
              />
              <Button type="submit" variant="outline" className="sm:w-auto">
                Search
              </Button>
            </form>
          </CardHeader>

          <CardContent>
            {rows.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-lg space-y-3">
                <Plus className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="font-semibold text-lg">
                  No properties added yet.
                </p>
                <p className="text-sm text-gray-500">
                  Start managing your portfolio by adding your first property.
                </p>
                <Link href="/properties/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Property Now
                  </Button>
                </Link>
              </div>
            ) : (
              <PropertiesTable data={filteredRows} views={tabViews} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
