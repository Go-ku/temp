"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel, // Added for global filtering
} from "@tanstack/react-table";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";


export default function DataTable({ columns, data }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(""); // Renamed for clarity

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Added filter row model
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-6">
      
      {/* Filter Search */}
      <Input
        placeholder="Filter by invoice reference, property, or tenant..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm shadow-sm"
      />

      {/* Table Container */}
      <div className="border rounded-lg shadow-sm">
        <Table>
          
          {/* Table Header */}
          <TableHeader className="bg-gray-50/70">
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-gray-50/70">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/* Sorting Indicator */}
                        {sorted === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : sorted === "desc" ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          // Only show sorting icon if column can be sorted
                          header.column.getCanSort() && <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  No invoices found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}