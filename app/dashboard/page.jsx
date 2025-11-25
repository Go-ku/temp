import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const roleRouteMap = {
  admin: "/dashboard/admin",
  landlord: "/dashboard/landlord",
  tenant: "/dashboard/tenant",
  manager: "/dashboard/admin",
  maintenance: "/dashboard/maintenance",
};

export default async function DashboardIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const role = session.user.roles?.[0] || "tenant";
  const target = roleRouteMap[role] || "/dashboard/tenant";

  redirect(target);
}
