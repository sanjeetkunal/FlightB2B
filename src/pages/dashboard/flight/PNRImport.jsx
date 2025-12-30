// src/pages/dashboard/flight/PNRImport.jsx
import React, { useMemo, useState } from "react";

const SAMPLE_IMPORTED_PNRS = [
  {
    id: 1,
    importDate: "2025-11-28 11:32",
    pnr: "AB12CD",
    airline: "Vistara",
    gds: "Amadeus",
    source: "SINGLE", // SINGLE | BULK
    paxName: "Rahul Sharma",
    sector: "DEL-BOM",
    status: "IMPORTED", // IMPORTED | FAILED
    message: "Fetched successfully from GDS.",
  },
  {
    id: 2,
    importDate: "2025-11-28 11:40",
    pnr: "ZX98PQ",
    airline: "Emirates",
    gds: "Amadeus",
    source: "SINGLE",
    paxName: "Ananya Verma",
    sector: "DEL-DXB",
    status: "FAILED",
    message: "Invalid PNR / last name mismatch.",
  },
  {
    id: 3,
    importDate: "2025-11-28 12:05",
    pnr: "KL55MN",
    airline: "IndiGo",
    gds: "Galileo",
    source: "BULK",
    paxName: "Sanjeet Kunal",
    sector: "BOM-DEL",
    status: "IMPORTED",
    message: "Imported via CSV.",
  },
];

export default function PNRImport() {
  const [importMode, setImportMode] = useState("SINGLE"); // SINGLE | BULK
  const [sourceType, setSourceType] = useState("GDS"); // GDS | AIRLINE | API

  // single PNR fields
  const [pnr, setPnr] = useState("");
  const [lastName, setLastName] = useState("");
  const [airlineCode, setAirlineCode] = useState("");
  const [gds, setGds] = useState("Amadeus");
  const [rawDump, setRawDump] = useState("");

  // bulk fields
  const [bulkList, setBulkList] = useState(""); // each line: PNR,LASTNAME,AIRLINE
  const [bulkFileName, setBulkFileName] = useState("");

  const [preview, setPreview] = useState(null); // preview of parsed PNR
  const [toast, setToast] = useState(null);

  const summary = useMemo(() => {
    const total = SAMPLE_IMPORTED_PNRS.length;
    const imported = SAMPLE_IMPORTED_PNRS.filter(
      (r) => r.status === "IMPORTED"
    ).length;
    const failed = SAMPLE_IMPORTED_PNRS.filter(
      (r) => r.status === "FAILED"
    ).length;
    const single = SAMPLE_IMPORTED_PNRS.filter(
      (r) => r.source === "SINGLE"
    ).length;
    const bulk = SAMPLE_IMPORTED_PNRS.filter(
      (r) => r.source === "BULK"
    ).length;

    return { total, imported, failed, single, bulk };
  }, []);

  const showToast = (msg, tone = "success") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2500);
  };

  const handleParseDump = () => {
    if (!rawDump.trim()) {
      showToast("PNR dump paste karo pehle.", "error");
      return;
    }

    // Demo parsing – real me yahan regex / line parser lagaoge
    const fakePNR =
      pnr ||
      (rawDump.match(/[A-Z0-9]{6}/)?.[0] ?? "ABC123");
    const fakeName =
      lastName ||
      (rawDump.match(/([A-Z]+\/[A-Z]+)/)?.[1] ?? "TEST/PAX");
    const fakeAirline = airlineCode || "XX";

    setPreview({
      pnr: fakePNR,
      paxName: fakeName.replace("/", " "),
      airline: fakeAirline,
      gds,
      sectors: ["DEL-BOM"],
    });

    showToast("Demo parsing complete. Data auto-filled ho sakta hai.", "info");
  };

  const handleSingleImport = () => {
    if (!pnr.trim() || !lastName.trim()) {
      showToast("PNR aur Passenger Last Name required hai.", "error");
      return;
    }

    // yahan API call / GDS fetch hoga
    console.log("Import SINGLE PNR:", {
      pnr,
      lastName,
      airlineCode,
      gds,
      sourceType,
    });

    showToast("PNR import request bhej di gayi (demo).", "success");
  };

  const handleBulkImport = () => {
    if (!bulkList.trim() && !bulkFileName) {
      showToast("Bulk PNR list ya CSV file select karo.", "error");
      return;
    }

    console.log("Bulk PNR import:", { bulkList, bulkFileName, sourceType });

    showToast("Bulk PNR import queue me daal diya (demo).", "success");
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-20 z-20 rounded-md px-3 py-2 text-xs shadow-md ${
            toast.tone === "success"
              ? "bg-emerald-600 text-white"
              : toast.tone === "error"
              ? "bg-rose-600 text-white"
              : "bg-slate-800 text-slate-50"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-0 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              PNR Import
            </h1>
            <p className="text-xs text-slate-500">
              Airline / GDS PNR ko system me import karo – single PNR ya bulk
              CSV se.
            </p>
          </div>
          <div className="flex gap-2 text-[11px]">
            <div className="flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-slate-50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Connected to Demo GDS</span>
            </div>
          </div>
        </div>

        {/* Mode & Source Switch */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Import mode */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={() => setImportMode("SINGLE")}
              className={`rounded-full border px-3 py-1 font-medium ${
                importMode === "SINGLE"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Single PNR Import
            </button>
            <button
              onClick={() => setImportMode("BULK")}
              className={`rounded-full border px-3 py-1 font-medium ${
                importMode === "BULK"
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Bulk Import (List / CSV)
            </button>
          </div>

          {/* Source type */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Source:
            </span>
            <button
              onClick={() => setSourceType("GDS")}
              className={`rounded-full border px-3 py-1 font-medium ${
                sourceType === "GDS"
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              GDS PNR
            </button>
            <button
              onClick={() => setSourceType("AIRLINE")}
              className={`rounded-full border px-3 py-1 font-medium ${
                sourceType === "AIRLINE"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Airline PNR
            </button>
            <button
              onClick={() => setSourceType("API")}
              className={`rounded-full border px-3 py-1 font-medium ${
                sourceType === "API"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              Supplier API
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5 text-[11px]">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Total Imported
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-800">
              {summary.total}
            </div>
            <div className="text-[10px] text-slate-400">
              Single: {summary.single} • Bulk: {summary.bulk}
            </div>
          </div>
          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-emerald-700">
              Successful
            </div>
            <div className="mt-1 text-xl font-semibold text-emerald-900">
              {summary.imported}
            </div>
          </div>
          <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium uppercase text-rose-700">
              Failed
            </div>
            <div className="mt-1 text-xl font-semibold text-rose-900">
              {summary.failed}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm lg:col-span-2">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Tips
            </div>
            <ul className="mt-1 list-disc pl-4 text-[10px] text-slate-500">
              <li>Single import me PNR + Last Name airline record ke hisaab se match hona chahiye.</li>
              <li>Bulk list format: <span className="font-mono">PNR,LASTNAME,AIRLINE</span> (per line).</li>
            </ul>
          </div>
        </div>

        {/* Main panel: Single or Bulk */}
        {importMode === "SINGLE" ? (
          <div className="mb-4 grid gap-4 lg:grid-cols-3">
            {/* Left: Form */}
            <div className="lg:col-span-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm text-[11px]">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Single PNR Import
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {/* PNR */}
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    PNR <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12CD"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Last Name */}
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    Passenger Last Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.toUpperCase())}
                    placeholder="e.g. SHARMA"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Airline Code */}
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    Airline Code
                  </label>
                  <input
                    type="text"
                    value={airlineCode}
                    onChange={(e) =>
                      setAirlineCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. UK / AI / EK"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] uppercase outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* GDS */}
                {sourceType === "GDS" && (
                  <div className="md:col-span-1">
                    <label className="mb-1 block text-[10px] font-medium text-slate-500">
                      GDS
                    </label>
                    <select
                      value={gds}
                      onChange={(e) => setGds(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Amadeus">Amadeus</option>
                      <option value="Galileo">Galileo</option>
                      <option value="Sabre">Sabre</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                {/* Raw dump */}
                <div className="md:col-span-3">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    PNR Dump (optional)
                  </label>
                  <textarea
                    value={rawDump}
                    onChange={(e) => setRawDump(e.target.value)}
                    rows={4}
                    placeholder="Yahan GDS / airline PNR ka full text dump paste kar sakte ho. System isse auto-parse kar sakta hai (demo)."
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Dump optional hai – sirf PNR + Last Name se bhi import ho jayega.</span>
                    <button
                      type="button"
                      onClick={handleParseDump}
                      className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-100"
                    >
                      🔍 Try Auto-Parse (Demo)
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPnr("");
                    setLastName("");
                    setAirlineCode("");
                    setRawDump("");
                    setPreview(null);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSingleImport}
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
                >
                  🚀 Import PNR
                </button>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm text-[11px]">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Preview / Parsed Data
                </div>
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[9px] text-slate-500">
                  Read-only (demo)
                </span>
              </div>

              {preview ? (
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">
                      PNR & Passenger
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {preview.pnr} • {preview.paxName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <div className="text-[10px] font-medium text-slate-500">
                        Airline
                      </div>
                      <div className="text-slate-800">{preview.airline}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-500">
                        GDS
                      </div>
                      <div className="text-slate-800">{preview.gds}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">
                      Sectors
                    </div>
                    <ul className="mt-1 space-y-1 text-[10px] text-slate-700">
                      {preview.sectors.map((s, i) => (
                        <li
                          key={s + i}
                          className="inline-flex rounded-full bg-slate-100 px-2 py-0.5"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2 rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                    Actual system me yahan se auto-fill hoga: pax list, fare
                    details, segments, SSR, remarks etc.
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[160px] items-center justify-center text-center text-[10px] text-slate-400">
                  Abhi koi preview nahi hai. PNR + Dump paste karke{" "}
                  <span className="mx-1 font-semibold">Try Auto-Parse</span> ya
                  direct Import PNR click karo.
                </div>
              )}
            </div>
          </div>
        ) : (
          // BULK IMPORT MODE
          <div className="mb-4 grid gap-4 lg:grid-cols-3">
            {/* Left: Bulk list / CSV */}
            <div className="lg:col-span-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm text-[11px]">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Bulk PNR Import (List / CSV)
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {/* Text list */}
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    Paste List (one per line)
                  </label>
                  <textarea
                    value={bulkList}
                    onChange={(e) => setBulkList(e.target.value)}
                    rows={6}
                    placeholder={"Format: PNR,LASTNAME,AIRLINE\nAB12CD,SHARMA,UK\nZX98PQ,VERMA,EK"}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] font-mono outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="mt-1 text-[10px] text-slate-400">
                    System is list ko line-by-line parse karke import karega.
                  </div>
                </div>

                {/* CSV upload */}
                <div className="md:col-span-1">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">
                    Upload CSV (optional)
                  </label>
                  <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-[10px] text-slate-500">
                    <div className="text-[11px] font-medium text-slate-700">
                      Drag & drop ya CSV file select karo
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBulkFileName(file.name);
                          showToast("Demo: CSV file select ho gayi.", "info");
                        } else {
                          setBulkFileName("");
                        }
                      }}
                      className="text-[10px]"
                    />
                    {bulkFileName && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{bulkFileName}</span>
                      </div>
                    )}
                    <div className="mt-1 text-[10px] text-slate-400">
                      Columns: PNR, LASTNAME, AIRLINE (additional columns ignore ho sakte hain).
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBulkList("");
                    setBulkFileName("");
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="rounded-md bg-indigo-600 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-500"
                >
                  🚀 Start Bulk Import
                </button>
              </div>
            </div>

            {/* Right: Info / Help */}
            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm text-[11px]">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Bulk Import Rules
              </div>
              <ul className="space-y-1 text-[10px] text-slate-600">
                <li>• Maximum 200 PNR ek batch me recommend hai.</li>
                <li>• Agar list aur CSV dono diye gaye hain, dono merge ho sakte hain.</li>
                <li>• Duplicate PNR ko system skip ya update kar sakta hai (config ke hisaab se).</li>
                <li>• Actual implementation me yahan background job / queue lagega.</li>
              </ul>
              <div className="mt-3 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] text-slate-500">
                Real project me yahan se tum:
                <ul className="mt-1 list-disc pl-4">
                  <li>PNR ko supplier API / GDS se fetch kar sakte ho.</li>
                  <li>Imported PNR ko directly <strong>My Bookings</strong> me push kar sakte ho.</li>
                  <li>Failed records ka separate error report download kara sakte ho.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recent imported PNRs */}
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-[11px] text-slate-500">
            <div className="font-medium text-slate-700">
              Recent Imported PNRs
            </div>
            <div className="text-[10px]">Last {SAMPLE_IMPORTED_PNRS.length} records (demo)</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 text-left">Imported At</th>
                  <th className="px-3 py-2 text-left">PNR / Pax</th>
                  <th className="px-3 py-2 text-left">Airline / GDS</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Message</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_IMPORTED_PNRS.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2">
                      {r.importDate}
                      <div className="text-[10px] text-slate-400">#{r.id}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-800">
                        {r.pnr}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {r.paxName}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {r.airline}
                      <div className="text-[10px] text-slate-400">
                        {r.gds}
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.sector}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[9px] uppercase text-slate-600">
                        {r.source}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "IMPORTED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-[220px]">
                      <span className="line-clamp-2 text-[10px] text-slate-500">
                        {r.message}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button className="mr-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        Open
                      </button>
                      <button className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100">
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}

                {SAMPLE_IMPORTED_PNRS.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      Abhi tak koi PNR import nahi hua (demo).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
            <div>Static demo data. Real implementation me yahan API + pagination aayega.</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
