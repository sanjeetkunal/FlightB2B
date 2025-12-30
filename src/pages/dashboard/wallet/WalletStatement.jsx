// src/pages/dashboard/wallet/WalletStatement.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WalletStatement() {
  const nav = useNavigate();
  const [from, setFrom] = useState("2025-11-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [format, setFormat] = useState("CSV");

  const download = () => {
    // ✅ Later: call your API
    // GET /api/wallet/statement?from=...&to=...&format=CSV|XLSX|PDF
    alert(`Demo: Statement download started (${format})`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Download Statement
            </h1>
            <p className="text-xs text-slate-500">
              Finance-ready wallet ledger export for B2B agency audits.
            </p>
          </div>
          <button
            onClick={() => nav(-1)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500">
                From
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500">
                To
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500">
              Format
            </label>
            <div className="mt-2 flex gap-2">
              {["CSV", "XLSX", "PDF"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${
                    format === f
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={download}
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
          >
            Download Statement
          </button>

          <div className="text-[10px] text-slate-400">
            Tip: CSV daily reconciliation ke liye best, XLSX finance teams ke liye, PDF audit attach ke liye.
          </div>
        </div>
      </div>
    </div>
  );
}
