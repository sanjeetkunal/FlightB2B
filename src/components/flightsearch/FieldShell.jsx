// components/flightsearch/FieldShell.jsx
export default function FieldShell({
  label,
  children,
  className = "",
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3">
        <div className="text-[11px] font-semibold text-slate-500">
          {label}
        </div>

        {/* IMPORTANT: min-w-0 so text doesn't push layout */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
