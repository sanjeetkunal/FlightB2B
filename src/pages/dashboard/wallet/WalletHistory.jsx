// src/pages/dashboard/wallet/WalletHistory.jsx
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
} from "lucide-react";

/**
 * Enterprise Wallet Ledger
 * ✅ No static colors: theme CSS vars only
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

const SAMPLE_TXN = [
  {
    id: 1,
    date: "2025-11-28",
    time: "10:22",
    type: "CREDIT",
    category: "TOPUP",
    ref: "TXN-88921",
    amount: 10000,
    status: "SUCCESS",
    narration: "Wallet top-up approved by admin",
    balanceAfter: 32500,
  },
  {
    id: 2,
    date: "2025-11-27",
    time: "18:10",
    type: "DEBIT",
    category: "FLIGHT_BOOKING",
    ref: "PNR-AB12CD",
    amount: 5400,
    status: "SUCCESS",
    narration: "Booking deduction (PNR AB12CD)",
    balanceAfter: 22500,
  },
  {
    id: 3,
    date: "2025-11-26",
    time: "12:40",
    type: "DEBIT",
    category: "HOLD_BLOCK",
    ref: "HOLD-7721",
    amount: 12000,
    status: "HOLD",
    narration: "Temporary hold for fare validation",
    balanceAfter: 27900,
  },
];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

function Badge({ children, tone = "neutral" }) {
  const cls =
    tone === "credit"
      ? "border-[color:var(--border)] bg-[var(--primarySoft)]"
      : tone === "debit"
      ? "border-[color:var(--border)] bg-[var(--surface2)]"
      : "border-[color:var(--border)] bg-[var(--surface2)]";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        cls
      )}
    >
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    SUCCESS: "bg-[var(--primarySoft)] border-[color:var(--border)]",
    HOLD: "bg-[var(--surface2)] border-[color:var(--border)]",
    FAILED: "bg-[var(--surface2)] border-[color:var(--border)]",
    PENDING: "bg-[var(--surface2)] border-[color:var(--border)]",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        map[status] || "bg-[var(--surface2)] border-[color:var(--border)]"
      )}
    >
      {status}
    </span>
  );
}

export default function WalletHistory() {
  const nav = useNavigate();

  // filters
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // pagination (UI-ready)
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    return Array.from(new Set(SAMPLE_TXN.map((t) => t.category)));
  }, []);

  const statuses = useMemo(() => {
    return Array.from(new Set(SAMPLE_TXN.map((t) => t.status)));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return SAMPLE_TXN.filter((t) => {
      if (type !== "ALL" && t.type !== type) return false;
      if (category !== "ALL" && t.category !== category) return false;
      if (status !== "ALL" && t.status !== status) return false;

      if (q) {
        const hay = `${t.ref} ${t.category} ${t.type} ${t.status} ${t.narration || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [type, category, status, search]);

  const totals = useMemo(() => {
    let credit = 0;
    let debit = 0;
    for (const t of filtered) {
      if (t.type === "CREDIT") credit += Number(t.amount || 0);
      if (t.type === "DEBIT") debit += Number(t.amount || 0);
    }
    return { credit, debit, net: credit - debit };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const resetFilters = () => {
    setType("ALL");
    setCategory("ALL");
    setStatus("ALL");
    setSearch("");
    setPage(1);
  };

  const onChangeAnyFilter = (fn) => (e) => {
    fn(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[260px]">
            <div className="text-[12px] text-[var(--muted)]">
              Wallet <span className="opacity-60">/</span> Ledger
            </div>
            <h1 className="mt-1 text-xl font-semibold">Wallet History</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Credits, debits, holds, booking deductions — all in one ledger.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => nav("/wallet/statement")}
              type="button"
              className={cx(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
            >
              <Download size={16} />
              Download Statement
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
            <div className="text-[11px] font-semibold text-[var(--muted)]">Credits (filtered)</div>
            <div className="mt-1 text-lg font-semibold">{formatINR(totals.credit)}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Debits (filtered)</div>
            <div className="mt-1 text-lg font-semibold">{formatINR(totals.debit)}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-[var(--muted)]">Net (filtered)</div>
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

            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
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
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-5">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Type
              </label>
              <select
                value={type}
                onChange={onChangeAnyFilter(setType)}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Category
              </label>
              <select
                value={category}
                onChange={onChangeAnyFilter(setCategory)}
                className={cx(
                  "mt-1 w-full rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              >
                <option value="ALL">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                onChange={onChangeAnyFilter(setStatus)}
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

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[var(--muted)]">
                Search
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[color:var(--primary)]">
                <SearchIcon size={16} className="opacity-70" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="PNR / TXN / HOLD / narration..."
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="inline-flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
              <Info size={14} className="mt-0.5" />
              <span>
                Showing results based on filters. In production, filters map to API query params
                (type, category, status, q, date range, pagination).
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
              transactions
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
                  <th className="px-4 py-3 text-left">Date / Time</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Narration</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Balance After</th>
                </tr>
              </thead>

              <tbody>
                {paged.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-[color:var(--border)] hover:bg-[var(--surface2)]/60"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">{t.date}</div>
                      <div className="text-[11px] text-[var(--muted)]">{t.time}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {t.type === "CREDIT" ? (
                        <Badge tone="credit">CREDIT</Badge>
                      ) : (
                        <Badge tone="debit">DEBIT</Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{t.category}</td>

                    <td className="px-4 py-3 whitespace-nowrap font-semibold">
                      {t.ref}
                    </td>

                    <td className="px-4 py-3 min-w-[240px] text-[11px] text-[var(--muted)]">
                      {t.narration || "—"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                      {formatINR(t.amount)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill status={t.status} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="font-semibold">{formatINR(t.balanceAfter)}</span>
                    </td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                    >
                      No transactions found.
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
              <span className="font-semibold text-[var(--text)]">{totalPages}</span>
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

        {/* Mobile note */}
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-3 text-[11px] text-[var(--muted)] lg:hidden">
          <div className="flex items-start gap-2">
            <Info size={14} className="mt-0.5" />
            <span>
              Tip: Use statement export for monthly reconciliation; ledger is for quick tracking.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
