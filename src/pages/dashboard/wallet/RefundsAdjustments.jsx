// src/pages/dashboard/wallet/RefundsAdjustments.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Filter,
  Info,
  RefreshCcw,
  Search as SearchIcon,
  SlidersHorizontal,
  Undo2,
  Wrench,
} from "lucide-react";

/**
 * Enterprise Refunds & Adjustments Ledger
 * ✅ No static colors: theme CSS vars only
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

const SAMPLE = [
  {
    id: 1,
    date: "2025-11-22",
    ref: "PNR-KL55MN",
    type: "REFUND",
    amount: 900,
    status: "PROCESSED",
    note: "Airline refund credited",
    channel: "AIRLINE",
  },
  {
    id: 2,
    date: "2025-11-25",
    ref: "ADJ-221",
    type: "ADJUSTMENT",
    amount: -200,
    status: "DONE",
    note: "Service fee correction",
    channel: "PORTAL",
  },
];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

function TypePill({ type }) {
  const icon =
    type === "REFUND" ? <Undo2 size={14} /> : <Wrench size={14} />;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        "border-[color:var(--border)] bg-[var(--surface2)]"
      )}
    >
      {icon}
      {type}
    </span>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        "border-[color:var(--border)] bg-[var(--primarySoft)]"
      )}
    >
      {status}
    </span>
  );
}

export default function RefundsAdjustments() {
  const nav = useNavigate();

  // filters
  const [type, setType] = useState("ALL"); // ALL | REFUND | ADJUSTMENT
  const [status, setStatus] = useState("ALL"); // ALL | ...
  const [channel, setChannel] = useState("ALL"); // ALL | AIRLINE | PORTAL
  const [q, setQ] = useState("");

  // pagination (UI-ready)
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const types = useMemo(() => Array.from(new Set(SAMPLE.map((x) => x.type))), []);
  const statuses = useMemo(() => Array.from(new Set(SAMPLE.map((x) => x.status))), []);
  const channels = useMemo(() => Array.from(new Set(SAMPLE.map((x) => x.channel))), []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return SAMPLE.filter((r) => {
      if (type !== "ALL" && r.type !== type) return false;
      if (status !== "ALL" && r.status !== status) return false;
      if (channel !== "ALL" && r.channel !== channel) return false;

      if (qq) {
        const hay = `${r.ref} ${r.type} ${r.status} ${r.note} ${r.channel}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      return true;
    });
  }, [type, status, channel, q]);

  const totals = useMemo(() => {
    let refunds = 0;
    let adjustments = 0;
    for (const r of filtered) {
      if (r.type === "REFUND") refunds += Number(r.amount || 0);
      if (r.type === "ADJUSTMENT") adjustments += Number(r.amount || 0);
    }
    return { refunds, adjustments, net: refunds + adjustments };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const reset = () => {
    setType("ALL");
    setStatus("ALL");
    setChannel("ALL");
    setQ("");
    setPage(1);
  };

  const exportDemo = () => {
    // ✅ Later:
    // GET /api/wallet/refunds-adjustments?filters...&format=CSV|XLSX
    alert("Demo: export started");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[260px]">
            <div className="text-[12px] text-[var(--muted)]">
              Wallet <span className="opacity-60">/</span> Refunds & Adjustments
            </div>

            <h1 className="mt-1 text-xl font-semibold">Refunds & Adjustments</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Airline refunds, portal adjustments, dispute resolution logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportDemo}
              className={cx(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={() => nav(-1)}
              type="button"
              className={cx(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Refunds (filtered)</div>
            <div className="mt-1 text-lg font-semibold">{formatINR(totals.refunds)}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Adjustments (filtered)</div>
            <div className="mt-1 text-lg font-semibold">{formatINR(totals.adjustments)}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Net impact</div>
            <div className="mt-1 text-lg font-semibold">{formatINR(totals.net)}</div>
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
              type="button"
              onClick={reset}
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
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

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
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value);
                  setPage(1);
                }}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                {channels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Search
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[color:var(--primary)]">
                <SearchIcon size={16} className="opacity-70" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="PNR / ADJ / note..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="inline-flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
              <Info size={14} className="mt-0.5" />
              <span>
                In production, this page should read from a dedicated audit ledger:
                refunds, manual adjustments, dispute resolutions with admin notes.
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] px-4 py-3 text-[12px] text-[var(--muted)]">
            <div>
              Showing{" "}
              <span className="font-semibold text-[var(--text)]">{filtered.length}</span>{" "}
              records
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2">
                <Filter size={16} />
                Page size
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className={cx(
                  "rounded-lg border px-2 py-1 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead className="bg-[var(--surface2)]">
                <tr className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Channel</th>
                  <th className="px-4 py-3 text-left">Note</th>
                </tr>
              </thead>

              <tbody>
                {paged.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[color:var(--border)] hover:bg-[var(--surface2)]/60"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">{r.date}</div>
                      <div className="text-[11px] text-[var(--muted)]">—</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-semibold">
                      {r.ref}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <TypePill type={r.type} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span
                        className={cx(
                          "font-semibold",
                          r.amount < 0 ? "text-[var(--text)]" : "text-[var(--text)]"
                        )}
                        title={r.amount < 0 ? "Debit / negative adjustment" : "Credit / refund"}
                      >
                        {formatINR(r.amount)}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill status={r.status} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-[var(--muted)]">
                      {r.channel || "—"}
                    </td>

                    <td className="px-4 py-3 min-w-[260px] text-[11px] text-[var(--muted)]">
                      {r.note || "—"}
                    </td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                    >
                      No refund/adjustment records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--border)] px-4 py-3 text-[12px] text-[var(--muted)]">
            <div>
              Page{" "}
              <span className="font-semibold text-[var(--text)]">{safePage}</span> of{" "}
              <span className="font-semibold text-[var(--text)]">
                {Math.max(1, Math.ceil(filtered.length / pageSize))}
              </span>
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
