import { connectToDatabase } from "@/lib/db/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Invoice from "@/models/Invoice";
import Property from "@/models/Property";
import Tenant from "@/models/Tenant";
import Lease from "@/models/Lease"; // Although unused, kept for context

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import InvoiceTable from "@/components/invoices/invoices-table"; // Assumed component

export default async function InvoicesPage() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session?.user) return <div className="p-4">Unauthorized</div>;

  const role = session.user.roles?.[0];
  const userId = session.user.id;

  let invoices = [];
  let scopeDescription = "All invoices across the platform.";

  // --- DATA FETCHING LOGIC (Kept largely the same) ---
  
  if (role === "admin") {
    invoices = await Invoice.find({})
      .populate("tenant", "fullName")
      .populate("property", "title code")
      .sort({ dueDate: -1 })
      .lean();
  } else if (role === "landlord") {
    const props = await Property.find({ landlord: userId }).lean();
    const ids = props.map((p) => p._id);

    invoices = await Invoice.find({ property: { $in: ids } })
      .populate("tenant", "fullName")
      .populate("property", "title code")
      .sort({ dueDate: -1 })
      .lean();
    
    scopeDescription = "Invoices for your managed properties.";
  } else if (role === "tenant") {
    const tenant = await Tenant.findOne({ user: userId }).lean();
    if (tenant) {
      invoices = await Invoice.find({ tenant: tenant._id })
        .populate("tenant", "fullName")
        .populate("property", "title code")
        .sort({ dueDate: -1 })
        .lean();
    }
    scopeDescription = "Your rental and fee invoices.";
  }

  // --- DATA AGGREGATION FOR KPIS ---
  
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amountDue, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalPending = totalInvoiced - totalPaid;
  
  const overdueCount = invoices.filter(i => 
    i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.dueDate) < new Date())
  ).length;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(val);


  const safeInvoices = JSON.parse(JSON.stringify(invoices));

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">🧾 Invoices & Billing</h1>
        <p className="text-sm text-gray-500">
          {scopeDescription}
        </p>
      </div>

      {/* KPI GRID - Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InvoiceKpiCard 
          title="Total Invoiced" 
          value={formatCurrency(totalInvoiced)} 
          icon={DollarSign}
          theme="primary"
        />
        <InvoiceKpiCard 
          title="Total Collected" 
          value={formatCurrency(totalPaid)} 
          icon={CheckCircle}
          theme="success"
        />
        <InvoiceKpiCard 
          title="Pending Collection" 
          value={formatCurrency(totalPending)} 
          icon={Clock}
          theme="warning"
        />
        <InvoiceKpiCard 
          title="Overdue Count" 
          value={overdueCount} 
          icon={AlertTriangle}
          theme="danger"
        />
      </div>

      {/* INVOICES TABLE */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
             Filter, sort, and manage transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceTable data={safeInvoices} />
        </CardContent>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------
// Helper Component for KPI Cards (New)
// -----------------------------------------------------------



function InvoiceKpiCard({ title, value, icon: Icon, theme }) {
  let colorClass = "text-gray-900";
  let iconBgClass = "bg-gray-100 text-gray-600";
  
  switch (theme) {
    case 'success':
      colorClass = "text-green-700";
      iconBgClass = "bg-green-100 text-green-600";
      break;
    case 'warning':
      colorClass = "text-amber-700";
      iconBgClass = "bg-amber-100 text-amber-600";
      break;
    case 'danger':
      colorClass = "text-red-700";
      iconBgClass = "bg-red-100 text-red-600";
      break;
  }

  return (
    <Card className="shadow-sm border-l-4 border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`rounded-full p-2 ${iconBgClass}`}>
           <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <p className="text-xs text-gray-500 mt-1">{title.includes('Total') ? 'Across all properties' : 'Immediate actions needed'}</p>
      </CardContent>
    </Card>
  );
}