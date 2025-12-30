// src/pages/dashboard/flight/ReissueReport.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_REISSUE_REPORT = [
  {
    id: 1,
    bookingDate: "2025-11-15",
    reissueDate: "2025-11-20",
    travelDateOld: "2025-11-25",
    travelDateNew: "2025-11-28",
    oldPnr: "AB12CD",
    newPnr: "AB12CD*R1",
    airline: "Vistara",
    flightNoOld: "UK 970",
    flightNoNew: "UK 970",
    from: "DEL",
    to: "BOM",
    sector: "DOM", // DOM | INTL
    paxName: "Rahul Sharma",
    paxCount: 2,
    reissueType: "DATE_CHANGE", // DATE_CHANGE | ROUTE_CHANGE | NAME_CORRECTION | OTHERS
    status: "COMPLETED", // COMPLETED | PENDING | CANCELLED
    oldFare: 15400,
    newFare: 17200,
    fareDiff: 1800,
    reissueCharge: 500,
    serviceCharge: 200,
    totalCollected: 2500, // fareDiff + charges
    paymentMode: "UPI", // UPI | CARD | CASH | WALLET | BANK
    referenceNo: "REISSUE20251120001",
  },
  {
    id: 2,
    bookingDate: "2025-11-10",
    reissueDate: "2025-11-18",
    travelDateOld: "2025-12-01",
    travelDateNew: "2025-12-05",
    oldPnr: "ZX98PQ",
    newPnr: "ZX98PQ*R1",
    airline: "Emirates",
    flightNoOld: "EK 511",
    flightNoNew: "EK 511",
    from: "DEL",
    to: "DXB",
    sector: "INTL",
    paxName: "Ananya Verma",
    paxCount: 2,
    reissueType: "DATE_CHANGE",
    status: "PENDING",
    oldFare: 42800,
    newFare: 45200,
    fareDiff: 2400,
    reissueCharge: 800,
    serviceCharge: 300,
    totalCollected: 0, // abhi collect nahi kiya
    paymentMode: "BANK",
    referenceNo: "REISSUE20251118007",
  },
  {
    id: 3,
    bookingDate: "2025-11-05",
    reissueDate: "2025-11-12",
    travelDateOld: "2025-11-20",
    travelDateNew: "2025-11-20",
    oldPnr: "KL55MN",
    newPnr: "KL55MN*R1",
    airline: "IndiGo",
    flightNoOld: "6E 211",
    flightNoNew: "6E 213",
    from: "BOM",
    to: "DEL",
    sector: "DOM",
    paxName: "Sanjeet Kunal",
    paxCount: 1,
    reissueType: "ROUTE_CHANGE",
    status: "CANCELLED",
    oldFare: 5400,
    newFare: 6400,
    fareDiff: 1000,
    reissueCharge: 400,
    serviceCharge: 200,
    totalCollected: 0,
    paymentMode: "CARD",
    referenceNo: "REISSUE20251112003",
  },
];

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ReissueReport() {
  const todayISO = new Date().toISOString().slice(0, 10);

  // Filters
  const [fromDate, setFromDate] = useState("2025-11-01"); // Reissue From
  const [toDate, setToDate] = useState(todayISO);         // Reissue To
  const [status, setStatus] = useState("ALL");            // ALL | COMPLETED | PENDING | CANCELLED
  const [reissueType, setReissueType] = useState("ALL");  // ALL | DATE_CHANGE | ROUTE_CHANGE | NAME_CORRECTION | OTHERS
  const [sector, setSector] = useState("ALL");            // ALL | DOM | INTL
  const [airline, setAirline] = useState("ALL");
  const [mode, setMode] = useState("ALL");                // ALL | UPI | CARD | CASH | WALLET | BANK
  const [search, setSearch] = useState("");

  // Airline options
  const airlineOptions = useMemo(() => {
    const set = new Set();
    SAMPLE_REISSUE_REPORT.forEach((r) => set.add(r.airline));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return SAMPLE_REISSUE_REPORT.filter((r) => {
      // filter on reissueDate
      if (from || to) {
        const d = new Date(r.reissueDate);
        if (from && d < from) return false;
        if (to && d > to) return false;
      }

      if (status !== "ALL" && r.status !== status) return false;
      if (reissueType !== "ALL" && r.reissueType !== reissueType) return false;
      if (sector !== "ALL" && r.sector !== sector) return false;
      if (airline !== "ALL" && r.airline !== airline) return false;
      if (mode !== "ALL" && r.paymentMode !== mode) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = (
          r.oldPnr +
          " " +
          r.newPnr +
          " " +
          r.paxName +
          " " +
          r.from +
          " " +
          r.to +
          " " +
          r.flightNoOld +
          " " +
          r.flightNoNew +
          " " +
          r.referenceNo
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [fromDate, toDate, status, reissueType, sector, airline, mode, search]);

  // Summary
  const summary = useMemo(() => {
    const totalReissues = filtered.length;
    let completed = 0;
    let pending = 0;
    let cancelled = 0;
    let totalFareDiff = 0;
    let totalCharges = 0;
    let totalCollected = 0;

    filtered.forEach((r) => {
      if (r.status === "COMPLETED") completed++;
      if (r.status === "PENDING") pending++;
      if (r.status === "CANCELLED") cancelled++;
      totalFareDiff += r.fareDiff;
      totalCharges += r.reissueCharge + r.serviceCharge;
      totalCollected += r.totalCollected;
    });

    return {
      totalReissues,
      completed,
      pending,
      cancelled,
      totalFareDiff,
      totalCharges,
      totalCollected,
    };
  }, [filtered]);

  const handleExport = () => {
    alert("Reissue export (CSV/Excel) yahan implement kar sakte ho.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Reissue Report
            </h1>
            <p className="text-xs text-slate-500">
              Date / route / name change ka pura history, fare difference & charges ke sath.
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
                setStatus("ALL");
                setReissueType("ALL");
                setSector("ALL");
                setAirline("ALL");
                setMode("ALL");
                setSearch("");
              }}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6 text-[11px]">
            {/* Reissue From */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Reissue From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Reissue To */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Reissue To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
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
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Reissue Type */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Reissue Type
              </label>
              <select
                value={reissueType}
                onChange={(e) => setReissueType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="DATE_CHANGE">Date Change</option>
                <option value="ROUTE_CHANGE">Route Change</option>
                <option value="NAME_CORRECTION">Name Correction</option>
                <option value="OTHERS">Others</option>
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
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="DOM">Domestic</option>
                <option value="INTL">International</option>
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

            {/* Mode */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Payment Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
                <option value="WALLET">Wallet</option>
                <option value="BANK">Bank Transfer</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Search (PNR / Passenger / Route / Ref No)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. AB12CD / Rahul / DEL BOM / REISSUE2025..."
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Reissues
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.totalReissues}
            </div>
          </div>

          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-emerald-700">
              Completed
            </div>
            <div className="mt-1 text-xl font-semibold text-emerald-900">
              {summary.completed}
            </div>
          </div>

          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-amber-700">
              Pending
            </div>
            <div className="mt-1 text-xl font-semibold text-amber-900">
              {summary.pending}
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
              Fare Diff / Charges / Collected
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-900">
              Fare Diff: {formatINR(summary.totalFareDiff)}
            </div>
            <div className="text-[10px] text-slate-500">
              Charges: {formatINR(summary.totalCharges)}
            </div>
            <div className="text-[10px] text-emerald-700">
              Collected: {formatINR(summary.totalCollected)}
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
              Reissue date between{" "}
              <span className="font-medium">{fromDate || "start"}</span> to{" "}
              <span className="font-medium">{toDate || "end"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Reissue Date</th>
                  <th className="px-3 py-2 text-left">Booking / Travel</th>
                  <th className="px-3 py-2 text-left">PNR (Old → New)</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Pax</th>
                  <th className="px-3 py-2 text-left">Airline</th>
                  <th className="px-3 py-2 text-left">Reissue Type</th>
                  <th className="px-3 py-2 text-right">Old Fare</th>
                  <th className="px-3 py-2 text-right">New Fare</th>
                  <th className="px-3 py-2 text-right">Fare Diff</th>
                  <th className="px-3 py-2 text-right">Charges</th>
                  <th className="px-3 py-2 text-right">Collected</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Ref No.</th>
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
                      {r.reissueDate}
                      <div className="text-[10px] text-slate-400">#{r.id}</div>
                    </td>

                    <td className="px-3 py-2">
                      {r.bookingDate}
                      <div className="text-[10px] text-slate-400">
                        Old: {r.travelDateOld} / New: {r.travelDateNew}
                      </div>
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {r.oldPnr}
                      <div className="text-[10px] text-slate-500">
                        → {r.newPnr}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {r.flightNoOld} → {r.flightNoNew}
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
                      {r.reissueType === "DATE_CHANGE"
                        ? "Date Change"
                        : r.reissueType === "ROUTE_CHANGE"
                        ? "Route Change"
                        : r.reissueType === "NAME_CORRECTION"
                        ? "Name Correction"
                        : "Others"}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {formatINR(r.oldFare)}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {formatINR(r.newFare)}
                    </td>

                    <td className="px-3 py-2 text-right text-amber-800">
                      {formatINR(r.fareDiff)}
                    </td>

                    <td className="px-3 py-2 text-right text-rose-700">
                      {formatINR(r.reissueCharge + r.serviceCharge)}
                    </td>

                    <td className="px-3 py-2 text-right font-semibold text-emerald-800">
                      {formatINR(r.totalCollected)}
                    </td>

                    <td className="px-3 py-2">
                      {r.paymentMode === "BANK"
                        ? "Bank Transfer"
                        : r.paymentMode.charAt(0) +
                          r.paymentMode.slice(1).toLowerCase()}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "COMPLETED"
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
                      <div className="font-mono text-[10px] text-slate-700">
                        {r.referenceNo}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        View
                      </button>
                      <button className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      No reissue records found for selected filters.
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
