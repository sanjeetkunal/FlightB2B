import React, { type ComponentType } from "react";
import { Plane, Hotel, Train, Bus } from "lucide-react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export type ModuleKey = "flight" | "hotel" | "train" | "bus";

const MODULE_TABS: Array<{
  key: ModuleKey;
  label: string;
  Icon: ComponentType<any>;
}> = [
  { key: "flight", label: "Flight", Icon: Plane },
  { key: "hotel", label: "Hotel", Icon: Hotel },
  { key: "train", label: "Train", Icon: Train },
  { key: "bus", label: "Bus", Icon: Bus },
];

export default function ModuleTopTabs({
  active,
  onChange,
}: {
  active: ModuleKey;
  onChange: (m: ModuleKey) => void;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-1",
        "inline-flex items-center gap-1"
      )}
    >
      {MODULE_TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cx(
              "h-10 px-3 rounded-lg inline-flex items-center gap-2 text-sm font-semibold transition",
              isActive
                ? "bg-[var(--primarySoft)] border border-[color:var(--border)]"
                : "border border-transparent hover:bg-[var(--surface2)]"
            )}
          >
            <Icon size={16} className="opacity-90" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
