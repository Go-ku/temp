"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/leases", label: "Leases" },
  { href: "/invoices", label: "Invoices" },
  { href: "/payments", label: "Payments" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/tenants", label: "Tenants" },
];

function NavItem({ href, label, isActive }) {
  const base =
    "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150";
  const active = "bg-slate-900 text-white shadow-sm";
  const idle = "text-slate-600 hover:text-slate-900 hover:bg-slate-100";

  return (
    <Link href={href} className={`${base} ${isActive ? active : idle}`}>
      {label}
    </Link>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const isActive = (href) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const initials = (user?.fullName || user?.name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-slate-900">
          Nsaka
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={isActive(link.href)}
            />
          ))}
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
                <span className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  {initials}
                </span>
                <span className="hidden sm:block truncate max-w-[140px]">
                  {user.fullName || user.name || user.email}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/security">Security</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => signOut({ callbackUrl: "/sign-in" })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/sign-in" className="hover:text-slate-900">
              Sign in
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/sign-up" className="hover:text-slate-900">
              Create account
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
