// src/pages/dashboard/flight/HoldPNRReport.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_HOLDPNR_REPORT = [
  {
    id: 1,
    holdDate: "2025-11-25",
    expiryDate: "2025-11-26",
    confirmDate: null, // agar convert ho jaye to date aa jayegi
    pnr: "HPNR01",
    airline: "Vistara",
    flightNo: "UK 970",
    from: "DEL",
    to: "BOM",
    sector: "DOM", // DOM | INTL
    tripType: "ONEWAY", // ONEWAY | ROUND | INTLRT
    paxName: "Rahul Sharma",
    paxCount: 2,
    holdStatus: "ACTIVE", // ACTIVE | EXPIRED | CONFIRMED | CANCELLED
    holdFare: 15400,
    paidAmount: 0,
    balanceDue: 15400,
    paymentStatus: "UNPAID", // UNPAID | PARTIAL | PAID
    source: "PORTAL", // PORTAL | API | GDS
    createdBy: "Agent001",
    remarks: "Client yet to confirm.",
  },
  {
    id: 2,
    holdDate: "2025-11-24",
    expiryDate: "2025-11-25",
    confirmDate: "2025-11-24",
    pnr: "HPNR02",
    airline: "Emirates",
    flightNo: "EK 511",
    from: "DEL",
    to: "DXB",
    sector: "INTL",
    tripType: "INTLRT",
    paxName: "Ananya Verma",
    paxCount: 2,
    holdStatus: "CONFIRMED",
    holdFare: 42800,
    paidAmount: 42800,
    balanceDue: 0,
    paymentStatus: "PAID",
    source: "GDS",
    createdBy: "Agent002",
    remarks: "Converted to ticket same day.",
  },
  {
    id: 3,
    holdDate: "2025-11-20",
    expiryDate: "2025-11-21",
    confirmDate: null,
    pnr: "HPNR03",
    airline: "IndiGo",
    flightNo: "6E 211",
    from: "BOM",
    to: "DEL",
    sector: "DOM",
    tripType: "ONEWAY",
    paxName: "Sanjeet Kunal",
    paxCount: 1,
    holdStatus: "EXPIRED",
    holdFare: 5400,
    paidAmount: 0,
    balanceDue: 5400,
    paymentStatus: "UNPAID",
    source: "API",
    createdBy: "Agent001",
    remarks: "Hold expired – no response from client.",
  },
];

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function HoldPNRReport() {
  const todayISO = new Date().toISOString().slice(0, 10);

  // Filters
  const [fromDate, setFromDate] = useState("2025-11-01"); // Hold From
  const [toDate, setToDate] = useState(todayISO);         // Hold To
  const [status, setStatus] = useState("ALL");            // ALL | ACTIVE | EXPIRED | CONFIRMED | CANCELLED
  const [paymentStatus, setPaymentStatus] = useState("ALL"); // ALL | UNPAID | PARTIAL | PAID
  const [sector, setSector] = useState("ALL");            // ALL | DOM | INTL
  const [tripType, setTripType] = useState("ALL");        // ALL | ONEWAY | ROUND | INTLRT
  const [airline, setAirline] = useState("ALL");
  const [source, setSource] = useState("ALL");            // ALL | PORTAL | API | GDS
  const [search, setSearch] = useState("");

  // Airline options
  const airlineOptions = useMemo(() => {
    const set = new Set();
    SAMPLE_HOLDPNR_REPORT.forEach((r) => set.add(r.airline));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return SAMPLE_HOLDPNR_REPORT.filter((r) => {
      // filter on holdDate
      if (from || to) {
        const d = new Date(r.holdDate);
        if (from && d < from) return false;
        if (to && d > to) return false;
      }

      if (status !== "ALL" && r.holdStatus !== status) return false;
      if (paymentStatus !== "ALL" && r.paymentStatus !== paymentStatus) return false;
      if (sector !== "ALL" && r.sector !== sector) return false;
      if (tripType !== "ALL" && r.tripType !== tripType) return false;
      if (airline !== "ALL" && r.airline !== airline) return false;
      if (source !== "ALL" && r.source !== source) return false;

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
          r.flightNo +
          " " +
          r.createdBy
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [fromDate, toDate, status, paymentStatus, sector, tripType, airline, source, search]);

  // Summary
  const summary = useMemo(() => {
    const totalHolds = filtered.length;
    let active = 0;
    let expired = 0;
    let confirmed = 0;
    let cancelled = 0;
    let totalHoldFare = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    filtered.forEach((r) => {
      if (r.holdStatus === "ACTIVE") active++;
      if (r.holdStatus === "EXPIRED") expired++;
      if (r.holdStatus === "CONFIRMED") confirmed++;
      if (r.holdStatus === "CANCELLED") cancelled++;
      totalHoldFare += r.holdFare;
      totalPaid += r.paidAmount;
      totalBalance += r.balanceDue;
    });

    return {
      totalHolds,
      active,
      expired,
      confirmed,
      cancelled,
      totalHoldFare,
      totalPaid,
      totalBalance,
    };
  }, [filtered]);

  const handleExport = () => {
    alert("Hold PNR export (CSV/Excel) yahan implement kar sakte ho.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Hold PNR Report
            </h1>
            <p className="text-xs text-slate-500">
              Holded PNRs ka status, expiry, fare & balance ek hi jagah se track karo.
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
                setPaymentStatus("ALL");
                setSector("ALL");
                setTripType("ALL");
                setAirline("ALL");
                setSource("ALL");
                setSearch("");
              }}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7 text-[11px]">
            {/* Hold From */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Hold From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Hold To */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Hold To
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
                Hold Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CONFIRMED">Converted</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="PAID">Fully Paid</option>
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

            {/* Source */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
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
                Search (PNR / Passenger / Route / Agent)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. HPNR01 / Rahul / DEL BOM / Agent001"
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Hold PNRs
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.totalHolds}
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-sky-700">
              Active Holds
            </div>
            <div className="mt-1 text-xl font-semibold text-sky-900">
              {summary.active}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-emerald-700">
              Converted (Ticketed)
            </div>
            <div className="mt-1 text-xl font-semibold text-emerald-900">
              {summary.confirmed}
            </div>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-rose-700">
              Expired / Cancelled
            </div>
            <div className="mt-1 text-xl font-semibold text-rose-900">
              {summary.expired + summary.cancelled}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Hold Fare / Paid / Balance
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-900">
              Hold Fare: {formatINR(summary.totalHoldFare)}
            </div>
            <div className="text-[10px] text-emerald-700">
              Paid: {formatINR(summary.totalPaid)}
            </div>
            <div className="text-[10px] text-rose-700">
              Balance: {formatINR(summary.totalBalance)}
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
              Hold date between{" "}
              <span className="font-medium">{fromDate || "start"}</span> to{" "}
              <span className="font-medium">{toDate || "end"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Hold / Expiry</th>
                  <th className="px-3 py-2 text-left">PNR</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Pax</th>
                  <th className="px-3 py-2 text-left">Airline</th>
                  <th className="px-3 py-2 text-left">Trip / Sector</th>
                  <th className="px-3 py-2 text-right">Hold Fare</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                  <th className="px-3 py-2 text-left">Pay Status</th>
                  <th className="px-3 py-2 text-left">Hold Status</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Remarks</th>
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
                      {r.holdDate}
                      <div className="text-[10px] text-slate-400">
                        Exp: {r.expiryDate}
                      </div>
                    </td>

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
                      {formatINR(r.holdFare)}
                    </td>

                    <td className="px-3 py-2 text-right text-emerald-800">
                      {formatINR(r.paidAmount)}
                    </td>

                    <td className="px-3 py-2 text-right text-rose-800">
                      {formatINR(r.balanceDue)}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.paymentStatus === "PARTIAL"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.paymentStatus}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.holdStatus === "ACTIVE"
                            ? "bg-sky-100 text-sky-800"
                            : r.holdStatus === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.holdStatus === "EXPIRED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.holdStatus}
                      </span>
                    </td>

                    <td className="px-3 py-2">{r.source}</td>

                    <td className="px-3 py-2">{r.createdBy}</td>

                    <td className="px-3 py-2 max-w-[180px]">
                      <span className="line-clamp-2 text-[10px] text-slate-500">
                        {r.remarks}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        View
                      </button>
                      {r.holdStatus === "ACTIVE" && (
                        <button className="mr-1 rounded-full border border-emerald-300 px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-50">
                          Convert
                        </button>
                      )}
                      {r.holdStatus === "ACTIVE" && (
                        <button className="rounded-full border border-rose-300 px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50">
                          Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={15}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      No hold PNR records found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>Static demo data. Baad me API + pagination aayega.</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
