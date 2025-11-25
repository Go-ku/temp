import { cn } from "@/lib/utils";

export default function InvoiceStatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    partially_paid: "bg-blue-100 text-blue-800 border-blue-300",
    paid: "bg-green-100 text-green-800 border-green-300",
    overdue: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <span
      className={cn(
        "px-2 py-1 text-xs rounded border capitalize",
        colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
