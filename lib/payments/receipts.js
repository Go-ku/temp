import { generateReceiptForPayment as generateReceiptPdf } from "@/lib/pdf/generateReceipt";
import { sendPaymentReceiptEmail } from "@/lib/notifications/email";
import { sendPaymentReceiptSms } from "@/lib/notifications/sms";

export async function generateReceiptForPayment(paymentId) {
  return generateReceiptPdf(paymentId);
}

export { sendPaymentReceiptEmail, sendPaymentReceiptSms };
