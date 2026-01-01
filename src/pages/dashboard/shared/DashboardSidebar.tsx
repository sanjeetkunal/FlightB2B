import React, { type ComponentType } from "react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type SidebarItem = {
  key: string;
  label: string;
  Icon: ComponentType<any>;
  hint?: string;
};

export default function DashboardSidebar({
  title,
  subtitle,
  items,
  activeKey,
  onSelect,
  footerTip,
}: {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  footerTip?: string;
}) {
  return (
    <aside className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
      <div className="border-b border-[color:var(--border)] px-4 py-3">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle ? (
          <div className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</div>
        ) : null}
      </div>

      <div className="p-2 space-y-1">
        {items.map(({ key, label, Icon, hint }) => {
          const active = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cx(
                "w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition",
                active
                  ? "bg-[var(--primarySoft)] border border-[color:var(--border)]"
                  : "hover:bg-[var(--surface2)] border border-transparent"
              )}
            >
              <span
                className={cx(
                  "mt-0.5 h-9 w-9 rounded-lg border grid place-items-center",
                  "border-[color:var(--border)] bg-[var(--surface)]"
                )}
              >
                <Icon size={18} />
              </span>

              <span className="min-w-0">
                <div className="text-[13px] font-semibold truncate">{label}</div>
                <div className="text-[11px] text-[var(--muted)] truncate">
                  {hint ? hint : active ? "Active" : "Click to open"}
                </div>
              </span>
            </button>
          );
        })}
      </div>

      {footerTip ? (
        <div className="border-t border-[color:var(--border)] px-4 py-3 text-[11px] text-[var(--muted)]">
          {footerTip}
        </div>
      ) : null}
    </aside>
  );
}
