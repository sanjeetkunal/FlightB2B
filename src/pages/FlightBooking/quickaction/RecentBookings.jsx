// src/pages/FlightBooking/quickaction/RecentBookings.jsx (or your path)
import React, { useEffect, useState, useCallback } from "react";

function parseCssColor(input) {
  const s = String(input || "").trim();
  const m = s.match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) {
    let h = s.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  return null;
}
function rgba(rgb, a) {
  if (!rgb) return `rgba(0,0,0,${a})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}
function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function RecentBookings() {
  const bookings = [
    { pnr: "AD4K9Q", route: "DEL → BOM", pax: "2 Pax", amount: "₹12,450", status: "Ticketed", statusTone: "success", meta: "IndiGo • Today 11:40 AM" },
    { pnr: "K8LM2P", route: "BOM → DXB", pax: "1 Pax", amount: "₹22,890", status: "On Hold", statusTone: "warning", meta: "Air India • Yesterday 6:15 PM" },
    { pnr: "Q1TZ8N", route: "BLR → SIN", pax: "3 Pax", amount: "₹54,120", status: "Cancelled", statusTone: "danger", meta: "Singapore Airlines • 2 days ago" },
  ];

  const [bg, setBg] = useState({ left: "", right: "", frame: "" });

  const recompute = useCallback(() => {
    const primary = parseCssColor(getVar("--primary")) || parseCssColor("#06b6d4");
    const accent = parseCssColor(getVar("--accent")) || primary;

    setBg({
      frame: `linear-gradient(135deg, ${rgba(primary, 0.28)}, ${rgba(accent, 0.22)})`,
      left: `radial-gradient(90% 120% at 0% 15%, ${rgba(primary, 0.18)}, transparent 62%)`,
      right: `radial-gradient(90% 120% at 100% 15%, ${rgba(accent, 0.16)}, transparent 64%)`,
    });
  }, []);

  useEffect(() => {
    recompute();
    const obs = new MutationObserver(() => recompute());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    return () => obs.disconnect();
  }, [recompute]);

  return (
    <div className="relative rounded-3xl p-[1px] shadow-[0_18px_45px_rgba(0,0,0,0.08)]" style={{ backgroundImage: bg.frame }}>
      <div className="relative rounded-3xl border border-white/50 bg-[var(--surface)]/85 backdrop-blur-xl p-5">
        {/* BOTH SIDE LIGHT WASH */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: bg.left }} />
        <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: bg.right }} />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)]">Recent Bookings</h4>
              <p className="mt-1 text-xs text-[var(--muted)]">Latest PNR activity with quick status overview.</p>
            </div>

            <button type="button" className="text-xs font-semibold transition" style={{ color: "var(--primary)" }}>
              View All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <BookingRow key={b.pnr} b={b} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ b }) {
  const toneVar =
    b.statusTone === "success" ? "--success" : b.statusTone === "warning" ? "--warning" : "--danger";

  return (
    <button
      type="button"
      className="
        group w-full rounded-2xl border
        border-[var(--border)] bg-[var(--surface)]/90
        px-4 py-3 text-left
        hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]
        transition
      "
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition rounded-2xl"
        style={{ background: "linear-gradient(135deg, var(--primarySoft), rgba(0,0,0,0) 60%)" }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text)]">{b.route}</span>
            <span className="text-xs text-[var(--muted)]">•</span>
            <span className="text-xs text-[var(--muted)]">{b.pax}</span>
          </div>

          <div className="mt-1 text-xs text-[var(--muted)] truncate">{b.meta}</div>

          <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>
            <span>
              PNR: <span style={{ color: "var(--text)" }}>{b.pnr}</span>
            </span>
            <span className="opacity-60">•</span>
            <span>
              Amount: <span style={{ color: "var(--text)" }}>{b.amount}</span>
            </span>
          </div>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow-sm"
          style={{
            backgroundImage: `linear-gradient(90deg, var(${toneVar}), var(--accent))`,
          }}
        >
          {b.status}
        </span>
      </div>

      <div
        className="pointer-events-none mt-3 h-[2px] w-0 group-hover:w-full transition-all duration-300"
        style={{ backgroundImage: "linear-gradient(90deg, var(--primary), var(--accent))" }}
      />
    </button>
  );
}
