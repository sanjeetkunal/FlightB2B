import { useEffect, useMemo, useState } from "react";
import FieldShell from "./FieldShell";
import MultiMonthDatePicker from "./MultiMonthDatePicker";

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseYMD = (v) => {
  if (!v) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function DateField({
  label,
  value,
  onChange,
  disabled,
  offsetDays = 0,
  minDate,

  /** ✅ NEW: if disabled but user clicks, parent can switch trip etc */
  onDisabledClick,

  /** ✅ NEW: parent can force open after enabling */
  forceOpen = false,
  onForceOpenConsumed,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) return;
    if (value) return;

    const base = minDate ? new Date(minDate) : new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + offsetDays);

    onChange(toYMD(base));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, disabled, offsetDays, minDate]);

  const valDate = useMemo(() => parseYMD(value), [value]);

  const fmtDate = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
    []
  );
  const fmtDay = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: "long" }),
    []
  );

  // ✅ force open (used when return click switches to round trip)
  useEffect(() => {
    if (!forceOpen) return;
    setOpen(true);
    onForceOpenConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceOpen]);

  const display = valDate ? fmtDate.format(valDate) : "Select date";

  // ✅ change Disabled -> Click to select
  const dayName = valDate ? fmtDay.format(valDate) : disabled ? "Click to select" : "";

  const handlePick = (d) => {
    if (!d) return;
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    onChange(toYMD(x));
    setOpen(false);
  };

  const handleClick = () => {
    if (disabled) {
      onDisabledClick?.(); // ✅ parent will switch to round
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <div className="relative min-w-0">
      <FieldShell label={label}>
        <button
          type="button"
          onClick={handleClick}
          className={[
            "w-full text-left min-w-0 cursor-pointer",
            disabled ? "opacity-60" : "",
          ].join(" ")}
        >
          <div className="text-[18px] leading-6 font-extrabold text-[var(--text)] truncate">
            {display}
          </div>
          <div className="text-[12px] text-[var(--muted)] truncate">{dayName}</div>
        </button>
      </FieldShell>

      <MultiMonthDatePicker
        // ✅ calendar open only when not disabled
        open={open && !disabled}
        value={valDate}
        onChange={handlePick}
        onClose={() => setOpen(false)}
        months={2}
        minDate={minDate || new Date()}
        className="right-0 z-40"
      />
    </div>
  );
}
