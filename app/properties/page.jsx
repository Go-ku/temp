import Link from "next/link";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Home, MapPin, DollarSign, Edit, Eye, ShieldCheck, ShieldOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  await connectToDatabase();
  
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
    location: [p.address?.town, p.address?.city]
      .filter(Boolean)
      .join(", "),
    rent: p.defaultRentAmount != null
        ? `ZMW ${Number(p.defaultRentAmount).toLocaleString()}`
        : "—",
    status: p.isActive, // Pass boolean for dynamic badge styling
  }));

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">🏢 Property Portfolio</h1>
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
          <CardDescription>A complete list of units in your portfolio.</CardDescription>
        </CardHeader>
        
        <CardContent>
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[300px]">Property</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Default Rent</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold text-gray-900 flex items-center gap-3">
                         <Home className="h-4 w-4 text-gray-400 shrink-0 hidden sm:block" />
                         {row.title}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{row.landlord}</TableCell>
                      <TableCell className="text-sm text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                          {row.location || "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-700 whitespace-nowrap">
                          {row.rent}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={row.status ? "default" : "secondary"}
                          className={row.status ? "bg-green-600 hover:bg-green-600/90" : "bg-gray-400 hover:bg-gray-400/90"}
                        >
                          {row.status ? 
                            <><ShieldCheck className="h-3 w-3 mr-1" /> Active</> 
                          : 
                            <><ShieldOff className="h-3 w-3 mr-1" /> Inactive</>
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right w-[150px] whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Link href={`/properties/${row.id}`} title="View Details">
                            <Button size="icon" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/properties/${row.id}/edit`} title="Edit Property">
                            <Button size="icon" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-lg space-y-3">
              <Home className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="font-semibold text-lg">No properties added yet.</p>
              <p className="text-sm text-gray-500">
                Start managing your portfolio by adding your first property.
              </p>
              <Link href="/properties/new">
                 <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Property Now
                 </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}