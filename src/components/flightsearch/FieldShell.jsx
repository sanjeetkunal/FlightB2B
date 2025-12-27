// components/flightsearch/FieldShell.jsx
export default function FieldShell({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div
        className="
          rounded-2xl border border-[var(--border)]
          bg-[var(--surface)]
          shadow-sm px-4 py-3
          text-[var(--text)]
        "
      >
        <div className="text-[11px] font-semibold text-[var(--muted)]">
          {label}
        </div>

        {/* IMPORTANT: min-w-0 so text doesn't push layout */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
