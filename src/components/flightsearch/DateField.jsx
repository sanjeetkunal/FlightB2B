import { useEffect, useMemo, useState } from "react";
import FieldShell from "../flightsearch/FieldShell";
import MultiMonthDatePicker from "../flightsearch/MultiMonthDatePicker";

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ✅ safer parse for "YYYY-MM-DD" (avoid timezone/Invalid Date issues)
const parseYMD = (v) => {
  if (!v) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function DateField({ label, value, onChange, disabled, offsetDays = 0 }) {
  const [open, setOpen] = useState(false);

  // ✅ set default date only once when value empty and not disabled
  useEffect(() => {
    if (disabled) return;
    if (value) return;

    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    onChange(toYMD(d));
    // intentionally omit onChange from deps (parent may pass new ref)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, disabled, offsetDays]);

  const valDate = useMemo(() => parseYMD(value), [value]);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  );

  const display = valDate ? fmt.format(valDate) : "Select date";

  const handlePick = (d) => {
    if (!d) return;
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    onChange(toYMD(x));
    setOpen(false);
  };

  return (
    <div className="relative">
      <FieldShell label={label}>
        <button
          type="button"
          onClick={() => !disabled && setOpen((v) => !v)}
          className={`w-full text-left bg-transparent text-[16px] font-semibold outline-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {display}
        </button>
        <span className="ml-2" />
      </FieldShell>

      <MultiMonthDatePicker
        open={open && !disabled}
        value={valDate}
        onChange={handlePick}
        onClose={() => setOpen(false)}
        months={2}
        minDate={new Date()}
        className="right-0 z-30"
      />
    </div>
  );
}
