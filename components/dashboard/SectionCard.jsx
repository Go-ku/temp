export default function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
