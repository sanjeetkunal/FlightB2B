// src/pages/dashboard/flight/TravelCalendar.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_TRAVEL_EVENTS = [
  {
    id: 1,
    date: "2025-12-01",
    type: "FLIGHT", // FLIGHT | HOLD | REISSUE | REFUND
    label: "DEL → BOM (Vistara)",
    pnr: "AB12CD",
    status: "TICKETED",
  },
  {
    id: 2,
    date: "2025-12-01",
    type: "HOLD",
    label: "DEL → DXB (Emirates)",
    pnr: "HPNR02",
    status: "ACTIVE",
  },
  {
    id: 3,
    date: "2025-12-05",
    type: "REISSUE",
    label: "BOM → DEL (IndiGo)",
    pnr: "KL55MN*R1",
    status: "COMPLETED",
  },
  {
    id: 4,
    date: "2025-12-08",
    type: "FLIGHT",
    label: "DEL → GOI (IndiGo)",
    pnr: "GOA123",
    status: "TICKETED",
  },
  {
    id: 5,
    date: "2025-12-15",
    type: "REFUND",
    label: "DEL → DXB (Emirates)",
    pnr: "ZX98PQ",
    status: "APPROVED",
  },
  {
    id: 6,
    date: "2025-12-21",
    type: "FLIGHT",
    label: "DEL → COK (Air India)",
    pnr: "AIC567",
    status: "TICKETED",
  },
  {
    id: 7,
    date: "2025-11-30",
    type: "FLIGHT",
    label: "BOM → DEL (IndiGo)",
    pnr: "NOV789",
    status: "TICKETED",
  },
];

const typeMeta = {
  FLIGHT: { label: "Flights", badge: "bg-blue-100 text-blue-700" },
  HOLD: { label: "Hold PNRs", badge: "bg-slate-100 text-slate-700" },
  REISSUE: { label: "Reissues", badge: "bg-amber-100 text-amber-700" },
  REFUND: { label: "Refunds", badge: "bg-emerald-100 text-emerald-700" },
};

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function sameDay(d1, d2) {
  return toISO(d1) === toISO(d2);
}

function buildMonthGrid(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-based
  const firstOfMonth = new Date(year, month, 1);
  const firstDayIndex = firstOfMonth.getDay(); // 0 = Sunday

  // calendar start = Sunday of the week containing the 1st
  const start = new Date(year, month, 1 - firstDayIndex);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function TravelCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [filterType, setFilterType] = useState("ALL"); // ALL | FLIGHT | HOLD | REISSUE | REFUND

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth]
  );

  const calendarDays = useMemo(
    () => buildMonthGrid(currentMonth),
    [currentMonth]
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    SAMPLE_TRAVEL_EVENTS.forEach((e) => {
      if (filterType !== "ALL" && e.type !== filterType) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filterType]);

  const summary = useMemo(() => {
    const eventsThisMonth = SAMPLE_TRAVEL_EVENTS.filter((e) => {
      if (filterType !== "ALL" && e.type !== filterType) return false;
      const d = new Date(e.date);
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      );
    });

    const total = eventsThisMonth.length;
    const flights = eventsThisMonth.filter((e) => e.type === "FLIGHT").length;
    const holds = eventsThisMonth.filter((e) => e.type === "HOLD").length;
    const reissues = eventsThisMonth.filter((e) => e.type === "REISSUE")
      .length;
    const refunds = eventsThisMonth.filter((e) => e.type === "REFUND").length;

    return { total, flights, holds, reissues, refunds };
  }, [currentMonth, filterType]);

  const today = new Date();

  const goPrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const goToday = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Travel Calendar
            </h1>
            <p className="text-xs text-slate-500">
              Iss month ke saare upcoming flights, reissue, refund & hold PNR
              ek calendar view me.
            </p>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPrevMonth}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs hover:bg-slate-100"
            >
              ◀
            </button>
            <div className="min-w-[150px] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-800">
              {monthLabel}
            </div>
            <button
              onClick={goNextMonth}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs hover:bg-slate-100"
            >
              ▶
            </button>
            <button
              onClick={goToday}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Today
            </button>
          </div>
        </div>

        {/* Filter chips + summary */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={() => setFilterType("ALL")}
              className={`rounded-full border px-3 py-1 font-medium ${
                filterType === "ALL"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              All ({summary.total})
            </button>

            <button
              onClick={() => setFilterType("FLIGHT")}
              className={`rounded-full border px-3 py-1 font-medium ${
                filterType === "FLIGHT"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Flights ({summary.flights})
            </button>

            <button
              onClick={() => setFilterType("HOLD")}
              className={`rounded-full border px-3 py-1 font-medium ${
                filterType === "HOLD"
                  ? "border-slate-700 bg-slate-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Hold PNR ({summary.holds})
            </button>

            <button
              onClick={() => setFilterType("REISSUE")}
              className={`rounded-full border px-3 py-1 font-medium ${
                filterType === "REISSUE"
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Reissue ({summary.reissues})
            </button>

            <button
              onClick={() => setFilterType("REFUND")}
              className={`rounded-full border px-3 py-1 font-medium ${
                filterType === "REFUND"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Refunds ({summary.refunds})
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Flight</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span>Hold PNR</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Reissue</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Refund</span>
            </div>
          </div>
        </div>

        {/* Calendar card */}
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          {/* Week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {weekdays.map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 text-[11px]">
            {calendarDays.map((day, idx) => {
              const iso = toISO(day);
              const dayEvents = eventsByDate[iso] || [];
              const isCurrentMonth =
                day.getMonth() === currentMonth.getMonth() &&
                day.getFullYear() === currentMonth.getFullYear();
              const isToday = sameDay(day, today);

              return (
                <div
                  key={iso + idx}
                  className={`min-h-[90px] border-b border-r border-slate-100 p-1.5 align-top text-left ${
                    isCurrentMonth ? "bg-white" : "bg-slate-50/60"
                  }`}
                >
                  {/* Date header */}
                  <div className="mb-1 flex items-center justify-between">
                    <div
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                        isToday
                          ? "bg-slate-900 text-white"
                          : isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-slate-900/5 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                        {dayEvents.length} trip
                        {dayEvents.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Events list */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] ${
                          ev.type === "FLIGHT"
                            ? "border-blue-100 bg-blue-50"
                            : ev.type === "HOLD"
                            ? "border-slate-200 bg-slate-50"
                            : ev.type === "REISSUE"
                            ? "border-amber-100 bg-amber-50"
                            : "border-emerald-100 bg-emerald-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-medium text-slate-800">
                            {ev.label}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between text-[9px] text-slate-500">
                          <span>{ev.pnr}</span>
                          <span className="uppercase">
                            {ev.type === "FLIGHT"
                              ? "FLT"
                              : ev.type === "HOLD"
                              ? "HOLD"
                              : ev.type === "REISSUE"
                              ? "REIS"
                              : "RFND"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-slate-500">
                        + {dayEvents.length - 3} more…
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>
              Total{" "}
              <span className="font-semibold text-slate-800">
                {summary.total}
              </span>{" "}
              event(s) in {monthLabel}
            </div>
            <div className="flex gap-3">
              <span>Flights: {summary.flights}</span>
              <span>Hold: {summary.holds}</span>
              <span>Reissue: {summary.reissues}</span>
              <span>Refund: {summary.refunds}</span>
            </div>
          </div>
        </div>

        {/* Optional: small list view below (today's / upcoming) */}
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-[11px] shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Upcoming (next 7 days)
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {SAMPLE_TRAVEL_EVENTS.filter((e) => {
              const d = new Date(e.date);
              const diff =
                (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) /
                (1000 * 60 * 60 * 24);
              if (diff < 0 || diff > 7) return false;
              if (filterType !== "ALL" && e.type !== filterType) return false;
              return true;
            }).map((e) => (
              <div
                key={"up-" + e.id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-[10px] font-semibold text-white">
                    {new Date(e.date).getDate()}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-800">
                      {e.label}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {e.pnr} •{" "}
                      {typeMeta[e.type]?.label || e.type.toLowerCase()}
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                    e.type === "FLIGHT"
                      ? "bg-blue-100 text-blue-700"
                      : e.type === "HOLD"
                      ? "bg-slate-100 text-slate-700"
                      : e.type === "REISSUE"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {e.status}
                </span>
              </div>
            ))}

            {/* Agar kuch nahi mila */}
            {SAMPLE_TRAVEL_EVENTS.filter((e) => {
              const d = new Date(e.date);
              const diff =
                (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) /
                (1000 * 60 * 60 * 24);
              if (diff < 0 || diff > 7) return false;
              if (filterType !== "ALL" && e.type !== filterType) return false;
              return true;
            }).length === 0 && (
              <div className="py-3 text-center text-[10px] text-slate-400">
                Next 7 days me koi event nahi hai (current filter ke hisaab se).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
