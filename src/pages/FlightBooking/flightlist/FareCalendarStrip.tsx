import React, { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type FareDay = {
  date: string | Date;          // "2026-01-17" or Date
  price: number;               // 14962
  currency?: string;           // "₹"
  trend?: "deal" | "normal";   // deal = green-ish
  disabled?: boolean;          // if no fares
};

type Props = {
  items: FareDay[];
  value?: string | Date;                 // selected date
  onChange?: (date: Date, item: FareDay, index: number) => void;

  /** optional formatting */
  locale?: string;                       // "en-IN"
  currencySymbol?: string;               // default "₹"
  className?: string;

  /** scroll behavior */
  scrollStepPx?: number;                 // default: 280
};

function toDate(d: string | Date) {
  return d instanceof Date ? d : new Date(d);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function FareCalendarStrip({
  items,
  value,
  onChange,
  locale = "en-IN",
  currencySymbol = "₹",
  className = "",
  scrollStepPx = 320,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const btnLeftRef = useRef<HTMLButtonElement | null>(null);
  const btnRightRef = useRef<HTMLButtonElement | null>(null);

  const selectedDate = useMemo(() => (value ? toDate(value) : null), [value]);

  const fmtWeekday = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale]
  );
  const fmtMonthDay = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
    [locale]
  );

  const scrollBy = (dx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  // keep selected visible
  useEffect(() => {
    if (!selectedDate) return;
    const el = scrollerRef.current;
    if (!el) return;
    const idx = items.findIndex((x) => sameDay(toDate(x.date), selectedDate));
    if (idx < 0) return;

    const child = el.children.item(idx) as HTMLElement | null;
    if (!child) return;

    const left = child.offsetLeft;
    const right = left + child.offsetWidth;
    const viewLeft = el.scrollLeft;
    const viewRight = viewLeft + el.clientWidth;

    if (left < viewLeft + 12) el.scrollTo({ left: Math.max(0, left - 12), behavior: "smooth" });
    else if (right > viewRight - 12) el.scrollTo({ left: right - el.clientWidth + 12, behavior: "smooth" });
  }, [items, selectedDate]);

  return (
    <div
      className={[
        "relative w-full rounded-md overflow-hidden",
        "border",
        className,
      ].join(" ")}
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--surface) 90%, transparent)",
      }}
    >
      {/* left arrow */}
      <button
        ref={btnLeftRef}
        type="button"
        onClick={() => scrollBy(-scrollStepPx)}
        className="absolute left-0 top-0 z-10 h-full w-10 grid place-items-center transition"
        style={{
          background:
            "#fff",
          borderRight: "1px solid var(--border)",
          color: "var(--text)",
        }}
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} style={{ color: "var(--muted)" }} />
      </button>

      {/* right arrow */}
      <button
        ref={btnRightRef}
        type="button"
        onClick={() => scrollBy(scrollStepPx)}
        className="absolute right-0 top-0 z-10 h-full w-10 grid place-items-center transition"
        style={{
          background:
            "#fff",
          borderLeft: "1px solid var(--border)",
          color: "var(--text)",
        }}
        aria-label="Scroll right"
      >
        <ChevronRight size={18} style={{ color: "var(--muted)" }} />
      </button>

      {/* scroller */}
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto no-scrollbar"
        style={{
          paddingLeft: 40,
          paddingRight: 40,
        }}
      >
        {items.map((it, idx) => {
          const d = toDate(it.date);
          const isActive = selectedDate ? sameDay(d, selectedDate) : idx === 0;
          const isDisabled = !!it.disabled;

          return (
            <button
              key={`${d.toISOString()}-${idx}`}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange?.(d, it, idx)}
              className="relative flex min-w-[132px] flex-col items-center justify-center px-3 py-2 transition"
              style={{
                borderRight: "1px solid var(--border)",
                background: isActive
                  ? "color-mix(in srgb, var(--surface2) 92%, transparent)"
                  : "transparent",
                opacity: isDisabled ? 0.55 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {/* top date */}
              <div
                className="text-[12px] leading-none"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text)",
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {fmtWeekday.format(d)}, {fmtMonthDay.format(d)}
              </div>

              {/* price */}
              <div
                className="mt-1 text-[14px] leading-none"
                style={{
                  fontWeight: isActive ? 800 : 700,
                  color: isActive
                    ? "var(--primary)"
                    : it.trend === "deal"
                      ? "var(--success, var(--primary))"
                      : "var(--text)",
                }}
              >
                {it.currency || currencySymbol} {Number(it.price).toLocaleString(locale)}
              </div>

              {/* active underline (MMT style) */}
              {isActive ? (
                <div
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
