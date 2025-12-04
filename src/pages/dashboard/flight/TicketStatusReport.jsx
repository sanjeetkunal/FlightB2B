// src/pages/dashboard/flight/TicketStatusReport.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_TICKET_STATUS = [
  {
    id: 1,
    issueDate: "2025-11-20",
    travelDate: "2025-12-01",
    pnr: "AB12CD",
    ticketNo: "098-1234567890",
    airline: "Vistara",
    flightNo: "UK 970",
    from: "DEL",
    to: "BOM",
    sector: "DOM", // DOM | INTL
    tripType: "ONEWAY", // ONEWAY | ROUND | INTLRT
    paxName: "Rahul Sharma",
    paxCount: 1,
    status: "OPEN", // OPEN | USED | PARTIAL | NOSHOW | VOID | REFUNDED
    channel: "PORTAL", // PORTAL | API | GDS
    totalFare: 15400,
    usedValue: 0,
    remainingValue: 15400,
  },
  {
    id: 2,
    issueDate: "2025-11-10",
    travelDate: "2025-11-25",
    pnr: "ZX98PQ",
    ticketNo: "176-9876543210",
    airline: "Emirates",
    flightNo: "EK 511",
    from: "DEL",
    to: "DXB",
    sector: "INTL",
    tripType: "INTLRT",
    paxName: "Ananya Verma",
    paxCount: 2,
    status: "USED",
    channel: "GDS",
    totalFare: 42800,
    usedValue: 42800,
    remainingValue: 0,
  },
  {
    id: 3,
    issueDate: "2025-11-05",
    travelDate: "2025-11-20",
    pnr: "KL55MN",
    ticketNo: "055-1112223334",
    airline: "IndiGo",
    flightNo: "6E 211",
    from: "BOM",
    to: "DEL",
    sector: "DOM",
    tripType: "ONEWAY",
    paxName: "Sanjeet Kunal",
    paxCount: 1,
    status: "NOSHOW",
    channel: "PORTAL",
    totalFare: 5400,
    usedValue: 0,
    remainingValue: 0,
  },
  {
    id: 4,
    issueDate: "2025-11-12",
    travelDate: "2025-12-05",
    pnr: "RF1234",
    ticketNo: "098-5556667778",
    airline: "Air India",
    flightNo: "AI 803",
    from: "DEL",
    to: "BLR",
    sector: "DOM",
    tripType: "ROUND",
    paxName: "Rohit Kumar",
    paxCount: 1,
    status: "PARTIAL",
    channel: "API",
    totalFare: 21000,
    usedValue: 12000,
    remainingValue: 9000,
  },
  {
    id: 5,
    issueDate: "2025-11-08",
    travelDate: "2025-11-18",
    pnr: "RF5678",
    ticketNo: "098-9998887776",
    airline: "Vistara",
    flightNo: "UK 975",
    from: "DEL",
    to: "BOM",
    sector: "DOM",
    tripType: "ONEWAY",
    paxName: "Neha Singh",
    paxCount: 1,
    status: "REFUNDED",
    channel: "PORTAL",
    totalFare: 16000,
    usedValue: 0,
    remainingValue: 0,
  },
];

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TicketStatusReport() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const today = new Date();

  // Filters
  const [fromDate, setFromDate] = useState("2025-11-01"); // Travel From
  const [toDate, setToDate] = useState(todayISO);         // Travel To
  const [status, setStatus] = useState("ALL");            // ALL | OPEN | USED | PARTIAL | NOSHOW | VOID | REFUNDED
  const [sector, setSector] = useState("ALL");            // ALL | DOM | INTL
  const [tripType, setTripType] = useState("ALL");        // ALL | ONEWAY | ROUND | INTLRT
  const [airline, setAirline] = useState("ALL");
  const [channel, setChannel] = useState("ALL");          // ALL | PORTAL | API | GDS
  const [search, setSearch] = useState("");

  // Airline options
  const airlineOptions = useMemo(() => {
    const set = new Set();
    SAMPLE_TICKET_STATUS.forEach((r) => set.add(r.airline));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return SAMPLE_TICKET_STATUS.filter((r) => {
      // filter on travelDate
      if (from || to) {
        const d = new Date(r.travelDate);
        if (from && d < from) return false;
        if (to && d > to) return false;
      }

      if (status !== "ALL" && r.status !== status) return false;
      if (sector !== "ALL" && r.sector !== sector) return false;
      if (tripType !== "ALL" && r.tripType !== tripType) return false;
      if (airline !== "ALL" && r.airline !== airline) return false;
      if (channel !== "ALL" && r.channel !== channel) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = (
          r.pnr +
          " " +
          r.ticketNo +
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
  }, [fromDate, toDate, status, sector, tripType, airline, channel, search]);

  // Summary
  const summary = useMemo(() => {
    const totalTickets = filtered.length;
    let open = 0;
    let used = 0;
    let partial = 0;
    let noshow = 0;
    let refunded = 0;
    let _void = 0;
    let totalFare = 0;
    let totalUsed = 0;
    let totalRemaining = 0;
    let upcoming = 0;
    let past = 0;

    filtered.forEach((r) => {
      if (r.status === "OPEN") open++;
      if (r.status === "USED") used++;
      if (r.status === "PARTIAL") partial++;
      if (r.status === "NOSHOW") noshow++;
      if (r.status === "REFUNDED") refunded++;
      if (r.status === "VOID") _void++;

      totalFare += r.totalFare;
      totalUsed += r.usedValue;
      totalRemaining += r.remainingValue;

      const t = new Date(r.travelDate);
      const diff =
        (t.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24);
      if (diff >= 0) upcoming++;
      else past++;
    });

    return {
      totalTickets,
      open,
      used,
      partial,
      noshow,
      refunded,
      void: _void,
      totalFare,
      totalUsed,
      totalRemaining,
      upcoming,
      past,
    };
  }, [filtered, today]);

  const handleExport = () => {
    alert("Ticket status export (CSV/Excel) yahan implement kar sakte ho.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Ticket Status Report
            </h1>
            <p className="text-xs text-slate-500">
              Kaun sa ticket open hai, kaun sa flown, partial used, no-show ya refunded – sab ek report me.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              ⬇️ Export (CSV/Excel)
            </button>
            <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
              📄 Print View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filters
            </div>
            <button
              onClick={() => {
                setFromDate("2025-11-01");
                setToDate(todayISO);
                setStatus("ALL");
                setSector("ALL");
                setTripType("ALL");
                setAirline("ALL");
                setChannel("ALL");
                setSearch("");
              }}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7 text-[11px]">
            {/* Travel From */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Travel From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Travel To */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Travel To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Ticket Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="OPEN">Open</option>
                <option value="USED">Used</option>
                <option value="PARTIAL">Partial Used</option>
                <option value="NOSHOW">No Show</option>
                <option value="REFUNDED">Refunded</option>
                <option value="VOID">Void</option>
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="ONEWAY">Oneway</option>
                <option value="ROUND">Roundtrip</option>
                <option value="INTLRT">Intl Roundtrip</option>
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
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                {airlineOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="PORTAL">Portal</option>
                <option value="API">API</option>
                <option value="GDS">GDS</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Search (PNR / Ticket / Passenger / Route)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. AB12CD / 098-1234567890 / Rahul / DEL BOM"
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Tickets
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.totalTickets}
            </div>
            <div className="text-[10px] text-slate-400">
              Upcoming: {summary.upcoming} • Past: {summary.past}
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-sky-700">
              Open / Partial
            </div>
            <div className="mt-1 text-xl font-semibold text-sky-900">
              {summary.open + summary.partial}
            </div>
            <div className="text-[10px] text-sky-800">
              Open: {summary.open} • Partial: {summary.partial}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-emerald-700">
              Used / Flown
            </div>
            <div className="mt-1 text-xl font-semibold text-emerald-900">
              {summary.used}
            </div>
            <div className="text-[10px] text-emerald-800">
              Value Used: {formatINR(summary.totalUsed)}
            </div>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-rose-700">
              No Show / Refunded / Void
            </div>
            <div className="mt-1 text-xl font-semibold text-rose-900">
              {summary.noshow + summary.refunded + summary.void}
            </div>
            <div className="text-[10px] text-rose-700">
              NS: {summary.noshow} • RF: {summary.refunded} • VD: {summary.void}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Fare / Remaining Value
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-900">
              Total Fare: {formatINR(summary.totalFare)}
            </div>
            <div className="text-[10px] text-slate-500">
              Remaining: {formatINR(summary.totalRemaining)}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-[11px] text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filtered.length}
              </span>{" "}
              records
            </div>
            <div className="text-[10px]">
              Travel date between{" "}
              <span className="font-medium">{fromDate || "start"}</span> to{" "}
              <span className="font-medium">{toDate || "end"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Travel / Issue</th>
                  <th className="px-3 py-2 text-left">PNR</th>
                  <th className="px-3 py-2 text-left">Ticket No.</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Pax</th>
                  <th className="px-3 py-2 text-left">Airline</th>
                  <th className="px-3 py-2 text-left">Trip / Sector</th>
                  <th className="px-3 py-2 text-right">Fare</th>
                  <th className="px-3 py-2 text-right">Used</th>
                  <th className="px-3 py-2 text-right">Remaining</th>
                  <th className="px-3 py-2 text-left">Channel</th>
                  <th className="px-3 py-2 text-left">Status</th>
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
                      {r.travelDate}
                      <div className="text-[10px] text-slate-400">
                        Issued: {r.issueDate}
                      </div>
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {r.pnr}
                      <div className="text-[10px] text-slate-400">
                        {r.flightNo}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="font-mono text-[10px] text-slate-800">
                        {r.ticketNo}
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

                    <td className="px-3 py-2">
                      {r.tripType === "ONEWAY"
                        ? "Oneway"
                        : r.tripType === "ROUND"
                        ? "Roundtrip"
                        : "Intl RT"}
                      <div className="text-[10px] text-slate-400">
                        {r.sector === "DOM" ? "Domestic" : "International"}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-right">
                      {formatINR(r.totalFare)}
                    </td>

                    <td className="px-3 py-2 text-right text-emerald-800">
                      {formatINR(r.usedValue)}
                    </td>

                    <td className="px-3 py-2 text-right text-amber-800">
                      {formatINR(r.remainingValue)}
                    </td>

                    <td className="px-3 py-2">{r.channel}</td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "OPEN"
                            ? "bg-sky-100 text-sky-800"
                            : r.status === "USED"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "PARTIAL"
                            ? "bg-amber-100 text-amber-800"
                            : r.status === "NOSHOW"
                            ? "bg-rose-100 text-rose-800"
                            : r.status === "REFUNDED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.status}
                      </span>
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
                      No ticket records found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>Static demo data. Baad me yahan API + pagination aayega.</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
