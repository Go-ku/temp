import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTenantInviteEmail({ email, fullName, tempPassword }) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Welcome to Nyumba — Your Tenant Account is Ready",
    html: `
      <p>Hi ${fullName},</p>

      <p>Your landlord has added you to the Nyumba Resident Portal.</p>

      <p>You can now log in to view:</p>
      <ul>
        <li>Your lease details</li>
        <li>Your rent invoices</li>
        <li>Your payment history</li>
        <li>Maintenance requests</li>
      </ul>

      <p><strong>Your temporary password:</strong> ${tempPassword}</p>

      <p>Please log in here and change your password immediately:</p>

      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/sign-in">Log In</a></p>

      <p>Welcome!</p>
      <p>Nyumba Real Estate</p>
    `,
  });
}
