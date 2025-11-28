"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, Users, Wallet, AlertCircle, 
  ArrowUpRight, Hammer, MoreHorizontal, Plus 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import FloatingActions from "@/components/dashboard/FloatingActions";

export default function DashboardClient({
  user,
  stats,
  rentTrend,
  properties,
  upcomingInvoices,
  recentPayments,
  maintenanceRequests,
  leaseCount
}) {
  
  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your real estate portfolio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
             View Reports
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Revenue (Month)" 
          value={formatCurrency(stats.collected)} 
          icon={Wallet} 
          trend="+12% from last month" // Placeholder for visual logic
          trendColor="text-green-600"
        />
        <KpiCard 
          title="Pending Rent" 
          value={formatCurrency(stats.pending)} 
          icon={AlertCircle} 
          trend="Due within 7 days"
          trendColor="text-amber-600"
        />
        <KpiCard 
          title="Total Properties" 
          value={stats.totalProperties} 
          icon={Building2} 
          subtext={`${leaseCount} Total Leases Recorded`}
        />
        <KpiCard 
          title="Active Tenants" 
          value={stats.activeTenants} 
          icon={Users} 
          subtext="100% Occupancy Rate"
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        
        {/* LEFT COLUMN (Charts & Financials) - Spans 4 cols */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* REVENUE CHART */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly rent collection performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rentTrend}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `K${value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {rentTrend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === rentTrend.length - 1 ? '#000' : '#d1d5db'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* RECENT PAYMENTS */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest transaction history</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/payments">View All <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                        {payment.tenant?.fullName?.[0] || "T"}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{payment.tenant?.fullName || "Unknown Tenant"}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.datePaid).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="font-medium text-sm">
                      +{formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
                {recentPayments.length === 0 && <p className="text-sm text-gray-500">No recent payments.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Operational) - Spans 3 cols */}
        <div className="lg:col-span-3 space-y-8">

          {/* UPCOMING INVOICES */}
          <Card className="shadow-sm border-l-4 border-l-amber-400">
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
              <CardDescription>Unpaid invoices & Overdue rent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInvoices.slice(0, 4).map((inv) => (
                 <Link 
                   key={inv._id} 
                   href={`/invoices/${inv._id}`}
                   className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50 hover:bg-amber-100/50 transition cursor-pointer group"
                 >
                   <div>
                     <p className="font-medium text-sm">Inv #{inv.reference}</p>
                     <p className="text-xs text-gray-500">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-amber-700">{formatCurrency(inv.amountDue - inv.amountPaid)}</p>
                     <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600/70">{inv.status}</p>
                   </div>
                 </Link>
              ))}
              {upcomingInvoices.length === 0 && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500"></div> All caught up!
                </div>
              )}
            </CardContent>
          </Card>

          {/* MAINTENANCE REQUESTS */}
          <Card className="shadow-sm">
             <CardHeader className="pb-3">
              <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {maintenanceRequests.slice(0, 4).map((req) => (
                <div key={req._id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between w-full">
                      <p className="text-sm font-medium">{req.title}</p>
                      <Badge variant="secondary" className="text-[10px] h-5">{req.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{req.property.title}</p>
                  </div>
                </div>
              ))}
              {maintenanceRequests.length === 0 && <p className="text-sm text-gray-500">No active tickets.</p>}
            </CardContent>
          </Card>

           {/* PROPERTIES MINI LIST */}
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.slice(0, 3).map((p) => (
                  <Link key={p._id} href={`/properties/${p._id}`} className="flex items-center gap-4 hover:opacity-70 transition">
                     <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-500" />
                     </div>
                     <div>
                        <p className="text-sm font-medium">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.address?.city}</p>
                     </div>
                  </Link>
                ))}
              </div>
            </CardContent>
           </Card>

        </div>
      </div>

      <FloatingActions role="landlord" />
    </div>
  );
}

// Simple Helper Component for KPI
function KpiCard({ title, value, icon: Icon, trend, trendColor, subtext }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend || subtext) && (
          <p className={`text-xs mt-1 ${trendColor || "text-gray-500"}`}>
            {trend || subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}