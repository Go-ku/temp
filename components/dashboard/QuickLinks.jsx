import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Wrench, Home, Users } from "lucide-react";

export default function QuickLinks({ role }) {
  const linksByRole = {
    admin: [
      { href: "/properties", label: "Properties", icon: Home },
      { href: "/leases", label: "Leases", icon: FileText },
      { href: "/invoices", label: "Invoices", icon: FileText },
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/maintenance", label: "Maintenance", icon: Wrench },
      { href: "/users", label: "Users", icon: Users },
    ],

    landlord: [
      { href: "/properties", label: "My Properties", icon: Home },
      { href: "/leases", label: "My Leases", icon: FileText },
      { href: "/invoices", label: "Invoices", icon: FileText },
      { href: "/payments", label: "Payments", icon: CreditCard },
    ],

    tenant: [
      { href: "/invoices", label: "My Invoices", icon: FileText },
      { href: "/payments", label: "My Payments", icon: CreditCard },
      { href: "/maintenance/new", label: "Report Issue", icon: Wrench },
    ],
  };

  const links = linksByRole[role] || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-center py-3 text-sm"
          >
            <Icon size={16} />
            {label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
