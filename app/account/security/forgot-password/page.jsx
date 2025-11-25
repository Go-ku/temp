import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-gray-600">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
