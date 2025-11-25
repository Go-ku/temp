"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Plus, Home, FilePlus, Wrench, CreditCard } from "lucide-react";
import Link from "next/link";

export default function FloatingDropdownActions({ role }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={28} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-56 p-2"
        >
          <DropdownMenuLabel className="text-center">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* NEW PROPERTY */}
          {(role === "admin" || role === "landlord") && (
            <DropdownMenuItem asChild>
              <Link
                href="/properties/new"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Home size={16} />
                New Property
              </Link>
            </DropdownMenuItem>
          )}

          {/* NEW LEASE */}
          {(role === "admin" ||
            role === "landlord" ||
            role === "manager") && (
            <DropdownMenuItem asChild>
              <Link
                href="/leases/new"
                className="flex items-center gap-2 cursor-pointer"
              >
                <FilePlus size={16} />
                New Lease
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* PAYMENTS */}
          <DropdownMenuItem asChild>
            <Link
              href="/payments"
              className="flex items-center gap-2 cursor-pointer"
            >
              <CreditCard size={16} />
              Payments
            </Link>
          </DropdownMenuItem>

          {/* MAINTENANCE */}
          <DropdownMenuItem asChild>
            <Link
              href="/maintenance/new"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Wrench size={16} />
              Maintenance Request
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
