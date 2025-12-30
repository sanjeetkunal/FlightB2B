// src/pages/dashboard/flight/FlightReport.jsx
import React, { useMemo, useState } from "react";

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
    sector: "DOM", // DOM | INTL
    tripType: "ONEWAY", // ONEWAY | ROUND
    paxName: "Rahul Sharma",
    paxCount: 2,
    status: "TICKETED", // TICKETED | CANCELLED | HOLD
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
  }).format(n);
}

export default function FlightReport() {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState("2025-11-01");
  const [toDate, setToDate] = useState(todayISO);
  const [sector, setSector] = useState("ALL"); // ALL | DOM | INTL
  const [tripType, setTripType] = useState("ALL"); // ALL | ONEWAY | ROUND
  const [status, setStatus] = useState("ALL"); // ALL | TICKETED | CANCELLED | HOLD
  const [airline, setAirline] = useState("ALL");
  const [search, setSearch] = useState("");

  // Airline list for filter
  const airlineOptions = useMemo(() => {
    const set = new Set();
    SAMPLE_FLIGHT_REPORT.forEach((r) => set.add(r.airline));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

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

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = (
          r.pnr +
          " " +
          r.paxName +
          " " +
          r.from +
          " " +
          r.to +
          " " +
          r.flightNo
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [fromDate, toDate, sector, tripType, status, airline, search]);

  // Summary stats from filtered data
  const summary = useMemo(() => {
    const totalBookings = filtered.length;
    let ticketed = 0;
    let cancelled = 0;
    let hold = 0;
    let totalRevenue = 0;
    let totalCommission = 0;

    filtered.forEach((r) => {
      if (r.status === "TICKETED") ticketed++;
      if (r.status === "CANCELLED") cancelled++;
      if (r.status === "HOLD") hold++;
      totalRevenue += r.total;
      totalCommission += r.agencyCommission;
    });

    return {
      totalBookings,
      ticketed,
      cancelled,
      hold,
      totalRevenue,
      totalCommission,
    };
  }, [filtered]);

  // Export dummy handler
  const handleExport = () => {
    // yahan baad me tum real CSV/Excel export laga sakte ho
    alert("Export functionality abhi demo hai. Yahan CSV/Excel generate kar sakte ho.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Flight Ticket Report
            </h1>
            <p className="text-xs text-slate-500">
              Booking date, PNR, sector, trip type, status, fare & commission ek hi screen par.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              ⬇️ Export (CSV/Excel)
            </button>
            <button className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
              📄 Print View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filters
            </div>
            <button
              onClick={() => {
                setFromDate("2025-11-01");
                setToDate(todayISO);
                setSector("ALL");
                setTripType("ALL");
                setStatus("ALL");
                setAirline("ALL");
                setSearch("");
              }}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6 text-[11px]">
            {/* From date */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Booking From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* To date */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Booking To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="DOM">Domestic</option>
                <option value="INTL">International</option>
              </select>
            </div>

            {/* Trip Type */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Trip Type
              </label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="ONEWAY">Oneway</option>
                <option value="ROUND">Roundtrip</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="TICKETED">Ticketed</option>
                <option value="HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Airline */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Airline
              </label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Search (PNR / Passenger / Route / Flight)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. AB12CD / Rahul / DEL BOM / 6E 211"
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Bookings
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.totalBookings}
            </div>
          </div>
          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-emerald-700">
              Ticketed
            </div>
            <div className="mt-1 text-xl font-semibold text-emerald-900">
              {summary.ticketed}
            </div>
          </div>
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-amber-700">
              On Hold
            </div>
            <div className="mt-1 text-xl font-semibold text-amber-900">
              {summary.hold}
            </div>
          </div>
          <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-rose-700">
              Cancelled
            </div>
            <div className="mt-1 text-xl font-semibold text-rose-900">
              {summary.cancelled}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Revenue
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {formatINR(summary.totalRevenue)}
            </div>
            <div className="text-[10px] text-slate-400">
              Commission: {formatINR(summary.totalCommission)}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-[11px] text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filtered.length}
              </span>{" "}
              records
            </div>
            <div className="text-[10px]">
              Booking date between{" "}
              <span className="font-medium">{fromDate || "start"}</span> to{" "}
              <span className="font-medium">{toDate || "end"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Booking Date</th>
                  <th className="px-3 py-2 text-left">Travel Date</th>
                  <th className="px-3 py-2 text-left">PNR</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Pax</th>
                  <th className="px-3 py-2 text-left">Airline</th>
                  <th className="px-3 py-2 text-right">Base</th>
                  <th className="px-3 py-2 text-right">Tax</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Sector</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2">
                      {r.bookingDate}
                      <div className="text-[10px] text-slate-400">
                        #{r.id}
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.travelDate}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {r.pnr}
                      <div className="text-[10px] text-slate-400">
                        {r.flightNo}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {r.from} → {r.to}
                      <div className="text-[10px] text-slate-400">
                        {r.paxName}
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.paxCount}</td>
                    <td className="px-3 py-2">{r.airline}</td>
                    <td className="px-3 py-2 text-right">
                      {formatINR(r.baseFare)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatINR(r.tax)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">
                      {formatINR(r.total)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "TICKETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.tripType === "ONEWAY" ? "Oneway" : "Roundtrip"}
                    </td>
                    <td className="px-3 py-2">
                      {r.sector === "DOM" ? "Domestic" : "International"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        View
                      </button>
                      <button className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        Ticket
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      No records found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer (placeholder for future pagination) */}
          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>Static demo data. Later yahan API + server pagination aayega.</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
