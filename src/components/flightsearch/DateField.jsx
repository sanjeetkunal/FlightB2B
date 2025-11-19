import { useMemo, useState } from "react";
import FieldShell from "../flightsearch/FieldShell";
import MultiMonthDatePicker from "../flightsearch/MultiMonthDatePicker";

export default function DateField({ label, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const valDate = value ? new Date(value) : null;

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
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");

    onChange(`${y}-${m}-${day}`);
    setOpen(false); // date pick hote hi calendar close
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

      {/* Multi-month calendar popover */}
      <MultiMonthDatePicker
        open={open && !disabled}
        value={valDate}
        onChange={handlePick}
        onClose={() => setOpen(false)}
        months={2}            // 3 karna ho to yahan change
        minDate={new Date()}  // aaj se pehle sab block
        className="right-0 z-30"
      />
    </div>
  );
}
