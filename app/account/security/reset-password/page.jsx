import ResetPasswordForm from "@/components/account/ResetPasswordForm";

export default function ResetPasswordPage({ searchParams }) {
  const token = searchParams.token;

  if (!token) {
    return <div className="p-6 text-center text-red-600">Invalid link.</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-xl font-semibold">Reset Password</h1>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
