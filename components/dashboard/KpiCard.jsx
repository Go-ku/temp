// components/dashboard/KpiCard.jsx
export default function KpiCard({ label, value, hint }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-1">
      <span className="text-xs uppercase text-gray-500 tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-semibold">{value}</span>
      {hint && (
        <span className="text-xs text-gray-400 mt-1">
          {hint}
        </span>
      )}
    </div>
  );
}
