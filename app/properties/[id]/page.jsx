import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import Property from "@/models/Property";
import Lease from "@/models/Lease";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import RecentPayments from "@/components/properties/recent-payments";
import { createPayment } from "@/app/(actions)/payments";

// Assuming the use of a client-side modal component
import DeleteButtonWithConfirmation from "@/components/DeleteButtonWithConfirmation"; 

// UI Components (Shadcn style imports)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  MapPin,
  DollarSign,
  User,
  Users,
  ShieldCheck,
  ShieldOff,
  FileText,
  Wrench,
  Wallet,
  Receipt,
  ListChecks,
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

export default async function PropertyDetailsPage({ params, searchParams }) {
  const { id } = (await params) || {};
  if (!id)
    return <div className="p-4 text-red-500">Property ID missing.</div>;

  await connectToDatabase();
  
  // 1. Fetch Property Data
  const property = await Property.findById(id)
    .populate("landlord", "name email")
    .populate("managers", "name email")
    .lean();

  if (!property) return <div className="p-4 text-gray-700">Property not found.</div>;
  
  const propertyData = JSON.parse(JSON.stringify(property));
  const propertyId = propertyData._id.toString();

  // 2. Fetch Leases and Check Occupancy
  const leasesRaw = await Lease.find({ property: id })
    .populate("tenant")
    .lean();
  const invoicesRaw = await Invoice.find({ property: id }).sort({ dueDate: -1 }).lean();
  const paymentsRaw = await Payment.find({ property: id }).sort({ datePaid: -1 }).lean();

  const leases = JSON.parse(JSON.stringify(leasesRaw));
  const invoices = JSON.parse(JSON.stringify(invoicesRaw));
  const payments = JSON.parse(JSON.stringify(paymentsRaw));

  const activeLeases = leases.filter((l) => l.status === "active");
  const hasActiveLease = activeLeases.length > 0;
  const primaryLease = leases[0] || null;
  const primaryTenant = primaryLease?.tenant || null;
  const resolvedSearchParams = (await searchParams) || {};
  const selectedTab = resolvedSearchParams?.view || "overview";
  const leaseOptions = leases.map((l) => ({
    id: l._id.toString(),
    label: `${l.tenant?.fullName || "Lease"} (${l.status})`,
  }));

  const location = [
    propertyData.address?.area,
    propertyData.address?.town,
    propertyData.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const landlordName = propertyData.landlord?.name || propertyData.landlord?.email || "—";
  const managerNames = propertyData.managers?.length
    ? propertyData.managers.map((m) => m.name || m.email).join(", ")
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

      <Tabs value={selectedTab} className="space-y-6" asChild>
        <div>
          <div className="flex flex-wrap items-center gap-3 border-b pb-3">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leases">Leases</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {leaseOptions.length > 0 && (
              <form
                action="/leases"
                className="ml-auto flex items-center gap-2 text-sm"
                method="get">
                <label htmlFor="leaseId" className="text-gray-600">
                  Jump to lease:
                </label>
                <select
                  id="leaseId"
                  name="id"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                  {leaseOptions.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.label}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline" size="sm">
                  Open
                </Button>
              </form>
            )}
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    Key property and management details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    <DetailItem icon={User} label="Landlord" value={landlordName} />
                    <DetailItem icon={Users} label="Managers" value={managerNames} />
                    <DetailItem icon={MapPin} label="Location" value={location || "—"} />
                    <DetailItem
                      icon={DollarSign}
                      label="Default Rent"
                      value={
                    propertyData.defaultRentAmount != null
                      ? `ZMW ${Number(propertyData.defaultRentAmount).toLocaleString()}`
                      : "—"
                  }
                />
                    <DetailItem icon={Building} label="Property Type" value={propertyData.type} />
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Property Status
                      </p>
                      <Badge
                        className={`mt-1 font-semibold ${
                          propertyData.isOccupied
                            ? "bg-blue-600 hover:bg-blue-700"
                            : propertyData.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                        }`}>
                        {propertyData.isOccupied
                          ? "Occupied"
                          : propertyData.isActive
                            ? "Active"
                            : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {(propertyData.description || propertyData.notes) && <hr className="my-4" />}
                  {propertyData.description && (
                    <DetailItem
                      icon={FileText}
                      label="Description"
                      value={propertyData.description}
                      isProse={true}
                    />
                  )}
                  {propertyData.notes && (
                    <DetailItem icon={FileText} label="Notes" value={propertyData.notes} isProse={true} />
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Occupancy</CardTitle>
                    <Badge
                      variant="outline"
                      className={`font-bold ${
                        hasActiveLease
                          ? "text-green-600 border-green-600"
                          : "text-amber-600 border-amber-600"
                      }`}>
                      {activeLeases.length} Active
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {hasActiveLease ? (
                      <p className="text-sm text-gray-700">
                        This property is currently occupied. View the leases section for tenant details
                        and payment history.
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

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{primaryLease ? "Active Lease" : "Add Lease"}</CardTitle>
                    <CardDescription>
                      {primaryLease
                        ? "Primary lease details for this property."
                        : "Create a lease to start tracking rent."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {primaryLease ? (
                      <>
                        <div className="flex justify-between">
                          <span>Reference</span>
                          <span className="font-semibold">
                            {primaryLease.leaseRef || primaryLease._id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span className="capitalize">{primaryLease.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rent</span>
                          <span className="font-semibold">
                            ZMW {Number(primaryLease.rentAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        <Link href={`/leases/${primaryLease._id}`}>
                          <Button className="w-full" variant="outline">
                            View Lease
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link href={`/leases/new?propertyId=${propertyId}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Create Lease
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{primaryTenant ? "Tenant" : "Add Tenant"}</CardTitle>
                    <CardDescription>
                      {primaryTenant
                        ? "Linked tenant details."
                        : "Link a tenant to the current lease."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {primaryTenant ? (
                      <>
                        <div className="flex justify-between">
                          <span>Name</span>
                          <span className="font-semibold">{primaryTenant.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email</span>
                          <span>{primaryTenant.email || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone</span>
                          <span>{primaryTenant.phone || "—"}</span>
                        </div>
                        <Link href={`/tenant/${primaryTenant._id}`}>
                          <Button className="w-full" variant="outline">
                            View Tenant
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link href={`/tenants/new?propertyId=${propertyId}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Add Tenant
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                <RecentPayments
                  payments={payments}
                  propertyId={propertyId}
                  leases={leases}
                  onCreatePayment={createPayment}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leases">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Leases</CardTitle>
                <CardDescription>All leases for this property.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leases.length === 0 ? (
                  <div className="text-sm text-gray-600">No leases yet.</div>
                ) : (
                  <div className="divide-y">
                    {leases.map((lease) => (
                      <div key={lease._id.toString()} className="py-3 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {lease.status} — Due Day {lease.dueDay || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lease.startDate
                              ? new Date(lease.startDate).toLocaleDateString("en-ZM")
                              : "No start"}{" "}
                            →{" "}
                            {lease.endDate
                              ? new Date(lease.endDate).toLocaleDateString("en-ZM")
                              : "Open-ended"}
                          </p>
                        </div>
                        <Link href={`/leases/${lease._id.toString()}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Recent invoices for this property.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoices.length === 0 ? (
                  <p className="text-sm text-gray-600">No invoices yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left">
                        <tr>
                          <th className="p-2">Reference</th>
                          <th className="p-2">Due</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoices.slice(0, 8).map((inv) => (
                          <tr key={inv._id.toString()}>
                            <td className="p-2">{inv.reference || inv.periodLabel}</td>
                            <td className="p-2">
                              {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-ZM") : "—"}
                            </td>
                            <td className="p-2">
                              ZMW {Number(inv.amountDue || 0).toLocaleString()}
                            </td>
                            <td className="p-2 capitalize">{inv.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Recent payments for this property.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-600">No payments yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left">
                        <tr>
                          <th className="p-2">Receipt</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.slice(0, 8).map((p) => (
                          <tr key={p._id.toString()}>
                            <td className="p-2">{p.receiptNumber || "—"}</td>
                            <td className="p-2">
                              {p.datePaid ? new Date(p.datePaid).toLocaleDateString("en-ZM") : "—"}
                            </td>
                            <td className="p-2">
                              ZMW {Number(p.amount || 0).toLocaleString()}
                            </td>
                            <td className="p-2 capitalize">{p.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
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
