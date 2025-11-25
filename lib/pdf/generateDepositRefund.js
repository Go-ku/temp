import { pdf } from "@react-pdf/renderer";
import { DepositRefundPdf } from "@/components/pdf/DepositRefundPdf";
import fs from "fs";
import path from "path";

export async function generateDepositRefundPdf(lease, amount, reason) {
  const doc = <DepositRefundPdf lease={lease} amount={amount} reason={reason} />;
  const buffer = await pdf(doc).toBuffer();

  const dir = path.join(process.cwd(), "public", "refunds");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `refund-${lease._id}-${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, buffer);

  return `/refunds/${filename}`;
}
