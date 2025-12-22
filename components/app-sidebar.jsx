"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/landlord",
      icon: IconDashboard,
    },
    {
      title: "Properties",
      url: "/properties",
      icon: IconFolder,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: IconFileDescription,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: IconReport,
    },
    {
      title: "Maintenance",
      url: "/maintenance/new",
      icon: IconHelp,
    },
  ],
  navSecondary: [
    {
      title: "Account Security",
      url: "/account/security",
      icon: IconSettings,
    },
    {
      title: "Forgot Password",
      url: "/account/security/forgot-password",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Add Property",
      url: "/properties/new",
      icon: IconFolder,
    },
    {
      name: "Onboard Tenant",
      url: "/tenants/onboarding",
      icon: IconUsers,
    },
    {
      name: "New Lease",
      url: "/leases/new",
      icon: IconFileWord,
    },
    {
      name: "Record Payment",
      url: "/payments/new",
      icon: IconReport,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
