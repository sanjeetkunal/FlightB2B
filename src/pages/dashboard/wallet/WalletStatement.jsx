// src/pages/dashboard/wallet/WalletStatement.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Timer,
} from "lucide-react";

/**
 * Enterprise-style Wallet Statement Export
 * ✅ No static colors (theme vars only)
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

const FORMATS = [
  { key: "CSV", label: "CSV", icon: <Download size={16} /> },
  { key: "XLSX", label: "XLSX", icon: <FileSpreadsheet size={16} /> },
  { key: "PDF", label: "PDF", icon: <FileText size={16} /> },
];

const QUICK_RANGES = [
  { key: "7D", label: "Last 7 days" },
  { key: "15D", label: "Last 15 days" },
  { key: "30D", label: "Last 30 days" },
  { key: "MTD", label: "This month" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function startOfMonthISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-01`;
}

function subtractDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function WalletStatement() {
  const nav = useNavigate();

  const [from, setFrom] = useState(startOfMonthISO());
  const [to, setTo] = useState(todayISO());
  const [format, setFormat] = useState("CSV");

  // optional filters for enterprise ledger exports
  const [scope, setScope] = useState("ALL"); // ALL | CREDITS | DEBITS
  const [includeGST, setIncludeGST] = useState(true);
  const [includeBookingRef, setIncludeBookingRef] = useState(true);

  const [touched, setTouched] = useState({});
  const [downloading, setDownloading] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!from) e.from = "Select a start date.";
    if (!to) e.to = "Select an end date.";

    if (from && to) {
      const f = new Date(from);
      const t = new Date(to);
      if (f > t) e.range = "`From` date cannot be after `To` date.";
      const days = Math.ceil((t - f) / (1000 * 60 * 60 * 24));
      if (days > 370) e.range = "Range too large. Please select up to 12 months.";
    }
    return e;
  }, [from, to]);

  const isValid = Object.keys(errors).length === 0;

  const applyQuickRange = (k) => {
    if (k === "7D") {
      setFrom(subtractDaysISO(7));
      setTo(todayISO());
    } else if (k === "15D") {
      setFrom(subtractDaysISO(15));
      setTo(todayISO());
    } else if (k === "30D") {
      setFrom(subtractDaysISO(30));
      setTo(todayISO());
    } else if (k === "MTD") {
      setFrom(startOfMonthISO());
      setTo(todayISO());
    }
  };

  const download = async () => {
    setTouched({ from: true, to: true });
    if (!isValid || downloading) return;

    setDownloading(true);
    try {
      // ✅ Later: call your API
      // GET /api/wallet/statement?from=...&to=...&format=...&scope=...&includeGST=...&includeBookingRef=...
      const payload = {
        from,
        to,
        format,
        scope,
        includeGST,
        includeBookingRef,
      };

      console.log("WALLET_STATEMENT_DOWNLOAD", payload);

      // demo delay
      await new Promise((r) => setTimeout(r, 650));
      alert(`Demo: Statement download started (${format})`);
    } catch (e) {
      console.error(e);
      alert("Could not start download. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[240px]">
            <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
              <button
                onClick={() => nav("/wallet")}
                className="hover:underline"
                type="button"
              >
                Wallet
              </button>
              <span className="opacity-60">/</span>
              <span>Statement Export</span>
            </div>

            <h1 className="mt-1 text-xl font-semibold">Download Statement</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Finance-ready wallet ledger export for B2B audits and reconciliation.
            </p>
          </div>

          <button
            onClick={() => nav(-1)}
            className={cx(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
              "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
            )}
            type="button"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Main Card */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[color:var(--border)] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Select period & export options</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    Choose a date range and export format. Large ranges may take longer.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {/* Quick ranges */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-[var(--muted)]">
                    Quick ranges
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    Current: <span className="font-semibold text-[var(--text)]">{from}</span>{" "}
                    → <span className="font-semibold text-[var(--text)]">{to}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_RANGES.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => applyQuickRange(r.key)}
                      className={cx(
                        "rounded-full border px-3 py-1 text-[11px] font-semibold",
                        "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--muted)]">
                    From
                  </label>
                  <input
                    type="date"
                    value={from}
                    onBlur={() => setTouched((p) => ({ ...p, from: true }))}
                    onChange={(e) => setFrom(e.target.value)}
                    className={cx(
                      "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                      "bg-[var(--surface)]",
                      "border-[color:var(--border)] focus:border-[color:var(--primary)]"
                    )}
                  />
                  {touched.from && errors.from && (
                    <div className="mt-1 text-[11px] text-[var(--muted)]">{errors.from}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--muted)]">
                    To
                  </label>
                  <input
                    type="date"
                    value={to}
                    onBlur={() => setTouched((p) => ({ ...p, to: true }))}
                    onChange={(e) => setTo(e.target.value)}
                    className={cx(
                      "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                      "bg-[var(--surface)]",
                      "border-[color:var(--border)] focus:border-[color:var(--primary)]"
                    )}
                  />
                  {touched.to && errors.to && (
                    <div className="mt-1 text-[11px] text-[var(--muted)]">{errors.to}</div>
                  )}
                </div>
              </div>

              {errors.range && (
                <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
                  <span className="font-semibold">Range issue:</span> {errors.range}
                </div>
              )}

              {/* Scope */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--muted)]">
                  Ledger scope
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { k: "ALL", t: "All transactions" },
                    { k: "CREDITS", t: "Credits only" },
                    { k: "DEBITS", t: "Debits only" },
                  ].map((x) => {
                    const active = scope === x.k;
                    return (
                      <button
                        key={x.k}
                        type="button"
                        onClick={() => setScope(x.k)}
                        className={cx(
                          "rounded-full border px-3 py-1 text-[11px] font-semibold",
                          active
                            ? "border-[color:var(--primary)] bg-[var(--primarySoft)]"
                            : "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                        )}
                      >
                        {x.t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--muted)]">
                  Export format
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FORMATS.map((f) => {
                    const active = format === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFormat(f.key)}
                        className={cx(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                          active
                            ? "border-[color:var(--primary)] bg-[var(--primarySoft)]"
                            : "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                        )}
                      >
                        {f.icon}
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 inline-flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
                  <Info size={14} className="mt-0.5" />
                  <span>
                    CSV is best for daily reconciliation, XLSX for finance teams, PDF for audit
                    attachments.
                  </span>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] p-3">
                  <input
                    type="checkbox"
                    checked={includeGST}
                    onChange={(e) => setIncludeGST(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-[12px] font-semibold">Include GST breakup</div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Helpful for accounting entries & invoices.
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] p-3">
                  <input
                    type="checkbox"
                    checked={includeBookingRef}
                    onChange={(e) => setIncludeBookingRef(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-[12px] font-semibold">Include booking reference</div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Adds PNR/Booking ID column for traceability.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[color:var(--border)] p-5">
              <button
                onClick={download}
                disabled={!isValid || downloading}
                type="button"
                className={cx(
                  "w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold",
                  !isValid || downloading
                    ? "cursor-not-allowed opacity-60 bg-[var(--primarySoft)]"
                    : "bg-[var(--primary)] hover:bg-[var(--primaryHover)]",
                  "text-white"
                )}
              >
                {downloading ? (
                  <>
                    <Timer size={16} />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download Statement
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Side summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="border-b border-[color:var(--border)] p-5">
                <div className="text-sm font-semibold">Export summary</div>
                <div className="mt-1 text-xs text-[var(--muted)]">Review your selection.</div>
              </div>

              <div className="space-y-3 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Period</span>
                  <span className="text-[12px] font-semibold">
                    {from} → {to}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Scope</span>
                  <span className="text-[12px] font-semibold">
                    {scope === "ALL" ? "All" : scope === "CREDITS" ? "Credits" : "Debits"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Format</span>
                  <span className="text-[12px] font-semibold">{format}</span>
                </div>

                <div className="mt-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] p-3 text-[11px] text-[var(--muted)]">
                  <div className="mb-1 font-semibold text-[var(--text)]">
                    Included columns
                  </div>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Txn Date, Type, Credit/Debit, Balance</li>
                    {includeBookingRef ? <li>PNR / Booking Ref</li> : null}
                    {includeGST ? <li>GST breakup (if applicable)</li> : null}
                    <li>Remarks / Narration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <Info size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Notes for finance</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
                    <li>Use CSV for bulk import into accounting tools.</li>
                    <li>XLSX is ideal for pivoting and reconciliation.</li>
                    <li>PDF works best for compliance & audit attachments.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mobile hint */}
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-3 text-[11px] text-[var(--muted)] lg:hidden">
              <div className="flex items-start gap-2">
                <Info size={14} className="mt-0.5" />
                <span>
                  Tip: Keep the range within 1-3 months for faster exports.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
