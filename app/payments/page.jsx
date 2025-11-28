import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";

// Models
import Payment from "@/models/Payment";
import Property from "@/models/Property";
import "@/models/Tenant"; // register for populate
import "@/models/Invoice"; // register for populate

// UI Components
import PaymentsTable from "@/components/payments/payments-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, XCircle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Payments",
};

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div className="p-4">Unauthorized</div>;
  }

  const role = session.user.roles?.[0];
  const userId = session.user.id;
  const tenantId = session.user.tenantId; // Assuming this is available for tenants

  await connectToDatabase();

  let payments = [];
  let scopeDescription = "All successful payments across the platform.";

  // --- DATA FETCHING ---
  
  const baseQuery = Payment.find({})
    .populate("tenant")
    .populate("property")
    .populate("invoice")
    .sort({ datePaid: -1 })
    .lean();

  if (role === "admin") {
    payments = await baseQuery;
  } else if (role === "landlord") {
    const properties = await Property.find({
      landlord: userId,
    }).lean();

    const propertyIds = properties.map((p) => p._id);
    payments = await baseQuery.where("property").in(propertyIds);
    scopeDescription = "Payments received for your managed properties.";
  } else if (role === "tenant") {
    payments = await baseQuery.where("tenant").equals(tenantId);
    scopeDescription = "A record of all your payments.";
  }

  // --- DATA AGGREGATION FOR KPIS ---

  const totalCollected = payments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments
    .filter(p => p.status === 'pending')
    .length;

  const failedCount = payments
    .filter(p => p.status === 'failed')
    .length;

  const successfulCount = payments
    .filter(p => p.status === 'successful')
    .length;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(val);

  // Ensure data is serializable for the client table
  const safePayments = JSON.parse(JSON.stringify(payments));

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">💰 Payments & Receipts</h1>
        <p className="text-sm text-gray-500">
          {scopeDescription}
        </p>
      </div>

      {/* KPI GRID - Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PaymentKpiCard 
          title="Total Collected" 
          value={formatCurrency(totalCollected)} 
          icon={DollarSign}
          theme="success"
        />
        <PaymentKpiCard 
          title="Successful Payments" 
          value={successfulCount} 
          icon={CheckCircle}
          theme="primary"
        />
        <PaymentKpiCard 
          title="Pending Payments" 
          value={pendingCount} 
          icon={Clock}
          theme="warning"
        />
        <PaymentKpiCard 
          title="Failed Payments" 
          value={failedCount} 
          icon={XCircle}
          theme="danger"
        />
      </div>

      {/* PAYMENTS TABLE */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          <PaymentsTable data={safePayments} />
        </div>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------
// Helper Component for KPI Cards
// -----------------------------------------------------------



function PaymentKpiCard({ title, value, icon: Icon, theme }) {
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
    case 'primary': // Blue for counts
      colorClass = "text-blue-700";
      iconBgClass = "bg-blue-100 text-blue-600";
      break;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`rounded-full p-2 ${iconBgClass}`}>
           <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <p className="text-xs text-gray-500 mt-1">{title.includes('Total') ? 'Lifetime collection' : 'Current transaction state'}</p>
      </CardContent>
    </Card>
  );
}