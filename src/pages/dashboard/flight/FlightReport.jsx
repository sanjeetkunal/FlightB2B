// src/pages/dashboard/flight/FlightReport.jsx
import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  Filter,
  Info,
  Printer,
  RefreshCcw,
  Search as SearchIcon,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Enterprise Flight Report (B2B)
 * ✅ No static colors: theme CSS vars only
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 *
 * Later API:
 * GET /api/reports/flights?from=...&to=...&sector=...&tripType=...&status=...&airline=...&q=...&page=...&pageSize=...
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

const SAMPLE_FLIGHT_REPORT = [
  {
    id: 1,
    bookingDate: "2025-11-25",
    travelDate: "2025-12-01",
    pnr: "AB12CD",
    airline: "Vistara",
    flightNo: "UK 970",
    from: "DEL",
    to: "BOM",
    sector: "DOM",
    tripType: "ONEWAY",
    paxName: "Rahul Sharma",
    paxCount: 2,
    status: "TICKETED",
    baseFare: 12000,
    tax: 3400,
    total: 15400,
    agencyCommission: 800,
  },
  {
    id: 2,
    bookingDate: "2025-11-26",
    travelDate: "2025-12-15",
    pnr: "ZX98PQ",
    airline: "Emirates",
    flightNo: "EK 511",
    from: "DEL",
    to: "DXB",
    sector: "INTL",
    tripType: "ROUND",
    paxName: "Ananya Verma",
    paxCount: 2,
    status: "HOLD",
    baseFare: 38000,
    tax: 4800,
    total: 42800,
    agencyCommission: 2200,
  },
  {
    id: 3,
    bookingDate: "2025-11-20",
    travelDate: "2025-11-28",
    pnr: "KL55MN",
    airline: "IndiGo",
    flightNo: "6E 211",
    from: "BOM",
    to: "DEL",
    sector: "DOM",
    tripType: "ONEWAY",
    paxName: "Sanjeet Kunal",
    paxCount: 1,
    status: "CANCELLED",
    baseFare: 4500,
    tax: 900,
    total: 5400,
    agencyCommission: 300,
  },
];

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function startOfMonthISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-01`;
}

function Pill({ children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        "border-[color:var(--border)] bg-[var(--surface2)] text-[var(--muted)]"
      )}
    >
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  // no colors, still visually different using soft surfaces
  const base =
    status === "TICKETED"
      ? "bg-[var(--primarySoft)]"
      : "bg-[var(--surface2)]";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        "border-[color:var(--border)]",
        base
      )}
    >
      {status}
    </span>
  );
}

function KpiCard({ title, value, sub }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="text-[11px] font-semibold text-[var(--muted)]">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-[var(--muted)]">{sub}</div> : null}
    </div>
  );
}

export default function FlightReport() {
  const [fromDate, setFromDate] = useState(startOfMonthISO());
  const [toDate, setToDate] = useState(todayISO());
  const [sector, setSector] = useState("ALL");
  const [tripType, setTripType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [airline, setAirline] = useState("ALL");
  const [q, setQ] = useState("");

  // table UX
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // sort
  const [sortBy, setSortBy] = useState("bookingDate"); // bookingDate | travelDate | total | commission
  const [sortDir, setSortDir] = useState("DESC"); // ASC | DESC

  const airlineOptions = useMemo(() => {
    const set = new Set();
    SAMPLE_FLIGHT_REPORT.forEach((r) => set.add(r.airline));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const qq = q.trim().toLowerCase();

    return SAMPLE_FLIGHT_REPORT.filter((r) => {
      // booking date range
      if (from || to) {
        const b = new Date(r.bookingDate);
        if (from && b < from) return false;
        if (to && b > to) return false;
      }

      if (sector !== "ALL" && r.sector !== sector) return false;
      if (tripType !== "ALL" && r.tripType !== tripType) return false;
      if (status !== "ALL" && r.status !== status) return false;
      if (airline !== "ALL" && r.airline !== airline) return false;

      if (qq) {
        const hay = `${r.pnr} ${r.paxName} ${r.from} ${r.to} ${r.flightNo} ${r.airline}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      return true;
    });
  }, [fromDate, toDate, sector, tripType, status, airline, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "ASC" ? 1 : -1;

    const getVal = (r) => {
      if (sortBy === "bookingDate") return new Date(r.bookingDate).getTime();
      if (sortBy === "travelDate") return new Date(r.travelDate).getTime();
      if (sortBy === "total") return Number(r.total || 0);
      if (sortBy === "commission") return Number(r.agencyCommission || 0);
      return 0;
    };

    arr.sort((a, b) => (getVal(a) - getVal(b)) * dir);
    return arr;
  }, [filtered, sortBy, sortDir]);

  const summary = useMemo(() => {
    const totalBookings = sorted.length;
    let ticketed = 0;
    let cancelled = 0;
    let hold = 0;
    let totalRevenue = 0;
    let totalCommission = 0;

    for (const r of sorted) {
      if (r.status === "TICKETED") ticketed++;
      if (r.status === "CANCELLED") cancelled++;
      if (r.status === "HOLD") hold++;
      totalRevenue += Number(r.total || 0);
      totalCommission += Number(r.agencyCommission || 0);
    }

    return {
      totalBookings,
      ticketed,
      cancelled,
      hold,
      totalRevenue,
      totalCommission,
    };
  }, [sorted]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  const reset = () => {
    setFromDate(startOfMonthISO());
    setToDate(todayISO());
    setSector("ALL");
    setTripType("ALL");
    setStatus("ALL");
    setAirline("ALL");
    setQ("");
    setSortBy("bookingDate");
    setSortDir("DESC");
    setPage(1);
  };

  const handleExport = () => {
    alert("Demo: Export started. Later yahan CSV/XLSX generate + download hoga.");
  };

  const handlePrint = () => {
    // Tip: you can add a dedicated print stylesheet later
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[260px]">
            <div className="text-[12px] text-[var(--muted)]">
              Reports <span className="opacity-60">/</span> Flights
            </div>
            <h1 className="mt-1 text-xl font-semibold">Flight Ticket Report</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Booking date, PNR, sector, trip type, status, fare & commission — one consolidated view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              type="button"
              className={cx(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
            >
              <Download size={16} />
              Export (CSV/XLSX)
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className={cx(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-white",
                "bg-[var(--primary)] hover:bg-[var(--primaryHover)]"
              )}
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal size={16} />
              Filters
            </div>

            <button
              onClick={reset}
              type="button"
              className={cx(
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
            >
              <RefreshCcw size={16} />
              Reset
            </button>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-6">
            {/* From */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Booking From
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[color:var(--primary)]">
                <CalendarDays size={16} className="opacity-70" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>

            {/* To */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Booking To
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[color:var(--primary)]">
                <CalendarDays size={16} className="opacity-70" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => {
                  setSector(e.target.value);
                  setPage(1);
                }}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                <option value="DOM">Domestic</option>
                <option value="INTL">International</option>
              </select>
            </div>

            {/* Trip type */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Trip Type
              </label>
              <select
                value={tripType}
                onChange={(e) => {
                  setTripType(e.target.value);
                  setPage(1);
                }}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                <option value="ONEWAY">Oneway</option>
                <option value="ROUND">Roundtrip</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                <option value="TICKETED">Ticketed</option>
                <option value="HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Airline */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Airline
              </label>
              <select
                value={airline}
                onChange={(e) => {
                  setAirline(e.target.value);
                  setPage(1);
                }}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                {airlineOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Search (PNR / Passenger / Route / Flight)
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[color:var(--primary)]">
                <SearchIcon size={16} className="opacity-70" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. AB12CD / Rahul / DEL BOM / 6E 211"
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Sort by
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={cx(
                    "w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                    "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                  )}
                >
                  <option value="bookingDate">Booking date</option>
                  <option value="travelDate">Travel date</option>
                  <option value="total">Total</option>
                  <option value="commission">Commission</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSortDir((d) => (d === "ASC" ? "DESC" : "ASC"))}
                  className={cx(
                    "rounded-lg border px-3 py-2 text-[12px] font-semibold",
                    "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                  )}
                  title="Toggle sort direction"
                >
                  {sortDir}
                </button>
              </div>
            </div>

            {/* Page size */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Page size
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2">
                <Filter size={16} className="opacity-70" />
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-[12px] outline-none"
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="inline-flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
              <Info size={14} className="mt-0.5" />
              <span>
                Demo data shown. Production me yahan API + server-side pagination + export service attach hoga.
              </span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard title="Total bookings" value={summary.totalBookings} />
          <KpiCard title="Ticketed" value={summary.ticketed} />
          <KpiCard title="On hold" value={summary.hold} />
          <KpiCard title="Cancelled" value={summary.cancelled} />
          <KpiCard
            title="Total revenue"
            value={formatINR(summary.totalRevenue)}
            sub={`Commission: ${formatINR(summary.totalCommission)}`}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] px-4 py-3 text-[12px] text-[var(--muted)]">
            <div>
              Showing{" "}
              <span className="font-semibold text-[var(--text)]">{sorted.length}</span>{" "}
              records
              <span className="ml-2">
                <Pill>
                  {fromDate || "start"} → {toDate || "end"}
                </Pill>
              </span>
            </div>

            <div className="text-[11px] text-[var(--muted)]">
              Page <b className="text-[var(--text)]">{safePage}</b> /{" "}
              <b className="text-[var(--text)]">{totalPages}</b>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead className="bg-[var(--surface2)]">
                <tr className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3 text-left">Booking</th>
                  <th className="px-4 py-3 text-left">Travel</th>
                  <th className="px-4 py-3 text-left">PNR / Flight</th>
                  <th className="px-4 py-3 text-left">Route / Pax</th>
                  <th className="px-4 py-3 text-left">Airline</th>
                  <th className="px-4 py-3 text-right">Base</th>
                  <th className="px-4 py-3 text-right">Tax</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Trip</th>
                  <th className="px-4 py-3 text-left">Sector</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[color:var(--border)] hover:bg-[var(--surface2)]/60"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">{r.bookingDate}</div>
                      <div className="text-[11px] text-[var(--muted)]">#{r.id}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{r.travelDate}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">{r.pnr}</div>
                      <div className="text-[11px] text-[var(--muted)]">{r.flightNo}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {r.from} → {r.to}
                      </div>
                      <div className="text-[11px] text-[var(--muted)]">
                        {r.paxName} · Pax {r.paxCount}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{r.airline}</td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {formatINR(r.baseFare)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {formatINR(r.tax)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                      {formatINR(r.total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {formatINR(r.agencyCommission)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill status={r.status} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.tripType === "ONEWAY" ? "Oneway" : "Roundtrip"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.sector === "DOM" ? "Domestic" : "International"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        className={cx(
                          "mr-2 rounded-md border px-2 py-1 text-[11px] font-semibold",
                          "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                        )}
                        onClick={() => alert(`Demo: View booking ${r.pnr}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className={cx(
                          "rounded-md border px-2 py-1 text-[11px] font-semibold",
                          "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                        )}
                        onClick={() => alert(`Demo: Ticket actions for ${r.pnr}`)}
                      >
                        Ticket
                      </button>
                    </td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                    >
                      No records found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--border)] px-4 py-3 text-[12px] text-[var(--muted)]">
            <div>
              Showing{" "}
              <b className="text-[var(--text)]">
                {(safePage - 1) * pageSize + (paged.length ? 1 : 0)}–
                {(safePage - 1) * pageSize + paged.length}
              </b>{" "}
              of <b className="text-[var(--text)]">{sorted.length}</b>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className={cx(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold",
                  "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                  safePage <= 1 && "cursor-not-allowed opacity-50"
                )}
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className={cx(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold",
                  "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]",
                  safePage >= totalPages && "cursor-not-allowed opacity-50"
                )}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
