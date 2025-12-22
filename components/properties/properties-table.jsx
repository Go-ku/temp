"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Home, MapPin, ShieldCheck, ShieldOff, Eye, Edit } from "lucide-react";

const propertyColumns = [
  {
    accessorKey: "title",
    header: "Property",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Home className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{item.title}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 text-red-500 shrink-0" />
            <span>{item.location || "N/A"}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "landlord",
    header: "Landlord",
  },
  {
    accessorKey: "rent",
    header: "Default Rent",
    cell: ({ row }) => (
      <span className="font-medium text-green-700 whitespace-nowrap">
        {row.original.rent}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status ? "default" : "secondary"}
        className={
          row.original.status
            ? "bg-green-600 hover:bg-green-600/90"
            : "bg-gray-400 hover:bg-gray-400/90"
        }>
        {row.original.status ? (
          <>
            <ShieldCheck className="h-3 w-3 mr-1" /> Active
          </>
        ) : (
          <>
            <ShieldOff className="h-3 w-3 mr-1" /> Inactive
          </>
        )}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <div className="flex justify-end gap-2">
          <Link href={`/properties/${id}`} title="View Details">
            <Button size="icon" variant="outline">
              <span className="sr-only">View property</span>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/properties/${id}/edit`} title="Edit Property">
            <Button size="icon" variant="outline">
              <span className="sr-only">Edit property</span>
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export default function PropertiesTable({
  data,
  views,
}) {
  return (
    <DataTable
      data={data}
      columns={propertyColumns}
      views={views}
    />
  );
}
