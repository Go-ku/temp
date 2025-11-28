import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import Lease from "@/models/Lease";
// Assuming the use of a client-side modal component
import DeleteButtonWithConfirmation from "@/components/DeleteButtonWithConfirmation"; 

// UI Components (Shadcn style imports)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, MapPin, DollarSign, User, Users, ShieldCheck, ShieldOff, FileText, Wrench 
} from "lucide-react";

// Server action for deletion (kept the same)
async function deleteAction(id) {
  "use server";
  // Assuming deleteProperty is implemented to handle cleanup/deletion
  // await deleteProperty(id); 
  console.log(`Property ID: ${id} deleted (mock action)`); // Placeholder for actual deleteProperty call
  redirect("/properties");
}

export const dynamic = "force-dynamic";

export default async function PropertyDetailsPage({params}) {
  const { id } = await params || {};
  if (!id) return <div className="p-4 text-red-500">Property ID missing.</div>;

  await connectToDatabase();
  
  // 1. Fetch Property Data
  const property = await Property.findById(id)
    .populate("landlord", "name email")
    .populate("managers", "name email")
    .lean();

  if (!property) return <div className="p-4 text-gray-700">Property not found.</div>;
  
  const plainProperty = JSON.parse(JSON.stringify(property));
  const propertyId = plainProperty._id.toString();

  // 2. Fetch Leases and Check Occupancy
  const leases = await Lease.find({ property: id }).lean();
  const activeLeases = leases.filter((l) => l.status === "active");
  const hasActiveLease = activeLeases.length > 0;
  
  const location = [
    property.address?.area,
    property.address?.town,
    property.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const landlordName = property.landlord?.name || property.landlord?.email || "—";
  const managerNames = property.managers?.length
    ? property.managers.map((m) => m.name || m.email).join(", ")
    : "—";

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building className="h-6 w-6 text-gray-600" />
            {property.title}
          </h1>
          <p className="text-md text-gray-500 mt-1">Code: **{property.code || "N/A"}**</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 flex-wrap">
          <Link href={`/properties/${propertyId}/maintenance`}>
            <Button size="sm" variant="outline">
               <Wrench className="h-4 w-4 mr-2" /> Maintenance
            </Button>
          </Link>
          <Link href={`/properties/${propertyId}/leases`}>
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Manage Leases ({leases.length})
            </Button>
          </Link>
          <Link href={`/properties/${propertyId}/edit`}>
            <Button size="sm">
              Edit Details
            </Button>
          </Link>
          {/* Using a client component for the destructive action with confirmation */}
          <DeleteButtonWithConfirmation
            action={deleteAction.bind(null, propertyId)}
            itemName={property.title}
            disabled={hasActiveLease}
            disabledTooltip="Cannot delete property with an active lease."
          />
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* OVERVIEW CARD (Span 2 columns) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Key property and management details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              
              {/* Landlord */}
              <DetailItem icon={User} label="Landlord" value={landlordName} />
              
              {/* Managers */}
              <DetailItem icon={Users} label="Managers" value={managerNames} />
              
              {/* Location */}
              <DetailItem icon={MapPin} label="Location" value={location || "—"} />

              {/* Default Rent */}
              <DetailItem 
                icon={DollarSign} 
                label="Default Rent" 
                value={property.defaultRentAmount != null
                  ? `ZMW ${Number(property.defaultRentAmount).toLocaleString()}`
                  : "—"} 
              />
              
              {/* Type */}
              <DetailItem icon={Building} label="Property Type" value={property.type} />
              
              {/* Status */}
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Property Status</p>
                <Badge 
                  className={`mt-1 font-semibold ${
                    property.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {property.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Description and Notes */}
            {(property.description || property.notes) && <hr className="my-4" />}
            
            {property.description && (
              <DetailItem icon={FileText} label="Description" value={property.description} isProse={true} />
            )}
            {property.notes && (
              <DetailItem icon={FileText} label="Notes" value={property.notes} isProse={true} />
            )}
          </CardContent>
        </Card>

        {/* SIDE CARD: OCCUPANCY / NEXT STEP */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Occupancy</CardTitle>
              <Badge variant="outline" className={`font-bold ${hasActiveLease ? 'text-green-600 border-green-600' : 'text-amber-600 border-amber-600'}`}>
                {activeLeases.length} Active
              </Badge>
            </CardHeader>
            <CardContent>
              {hasActiveLease ? (
                <p className="text-sm text-gray-700">
                  This property is currently occupied. View the leases section for tenant details and payment history.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    This property is vacant. Create a lease to start tracking rental income.
                  </p>
                  <Link href={`/leases/new?propertyId=${propertyId}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Create New Lease
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for cleaner UI
function DetailItem({ icon: Icon, label, value, isProse = false }) {
  return (
    <div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </p>
      {isProse ? (
        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="font-medium mt-1">{value}</p>
      )}
    </div>
  );
}

/* * NOTE: The DeleteButtonWithConfirmation component is crucial for good UX but must be 
* defined as a 'use client' component to handle the dialog state. Its implementation 
* is assumed here:
*
* // Example of components/common/DeleteButtonWithConfirmation.tsx
* 'use client';
* import { Button } from "@/components/ui/button";
* // Import Dialog/Modal components here
* const DeleteButtonWithConfirmation = ({ action, itemName, disabled, disabledTooltip }) => {
* // ... Modal/Confirmation logic here ...
* return (
* <Button size="sm" variant="destructive" onClick={() => setShowModal(true)} disabled={disabled}>
* Delete
* </Button>
* );
* }
*/