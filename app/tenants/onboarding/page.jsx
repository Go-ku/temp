import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db/mongoose";
import User from "@/models/User";
import Tenant from "@/models/Tenant";
import TenantOnboardingWizard from "@/components/tenants/TenantOnboardingWizard";

export default async function TenantOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.roles?.includes("tenant")) {
    return <div className="p-4">Unauthorized</div>;
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id).lean();
  const tenant = await Tenant.findOne({ user: user._id }).lean();

  if (!tenant) {
    return <div className="p-4">No tenant profile linked to this account.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <TenantOnboardingWizard user={user} tenant={tenant} />
    </div>
  );
}
