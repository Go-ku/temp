import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <div className="p-4">Unauthorized</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Security Settings</h1>
      <p className="text-sm text-gray-600">
        Update your password to keep your account secure.
      </p>

      <ChangePasswordForm />
    </div>
  );
}
