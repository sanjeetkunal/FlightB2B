import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  PauseCircle,
  Ticket,
  RefreshCcw,
  XCircle,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const ACTIONS = [
  {
    key: "import_pnr",
    label: "Import PNR",
    icon: Download,
    route: "/import-pnr",
    desc: "Retrieve booking using PNR",
    primary: true,
    tone: "blue",
  },
  {
    key: "book_hold",
    label: "Book & Hold",
    icon: PauseCircle,
    route: "/book-hold",
    desc: "Reserve fare without ticketing",
    disabledReason: "Insufficient credit limit",
    tone: "slate",
  },
  {
    key: "issue",
    label: "Issue Ticket",
    icon: Ticket,
    route: "/issue",
    desc: "Confirm & issue ticket",
    tone: "violet",
  },
  {
    key: "reschedule",
    label: "Reschedule",
    icon: RefreshCcw,
    route: "/reschedule",
    desc: "Modify travel dates",
    tone: "emerald",
  },
  {
    key: "cancel",
    label: "Cancel Booking",
    icon: XCircle,
    route: "/cancel",
    desc: "Cancel issued ticket",
    tone: "rose",
  },
  {
    key: "refund",
    label: "Refund Status",
    icon: Wallet,
    route: "/refunds",
    desc: "Track refund progress",
    tone: "amber",
  },
];

function toneClasses(tone) {
  // enterprise-ish: light gradient + icon blob
  switch (tone) {
    case "blue":
      return {
        blob: "bg-gradient-to-br from-blue-600 to-cyan-500",
        ring: "ring-blue-200/60",
        hover: "group-hover:shadow-[0_14px_28px_rgba(37,99,235,0.18)]",
      };
    case "violet":
      return {
        blob: "bg-gradient-to-br from-violet-600 to-fuchsia-500",
        ring: "ring-violet-200/60",
        hover: "group-hover:shadow-[0_14px_28px_rgba(124,58,237,0.18)]",
      };
    case "emerald":
      return {
        blob: "bg-gradient-to-br from-emerald-600 to-teal-500",
        ring: "ring-emerald-200/60",
        hover: "group-hover:shadow-[0_14px_28px_rgba(16,185,129,0.18)]",
      };
    case "rose":
      return {
        blob: "bg-gradient-to-br from-rose-600 to-pink-500",
        ring: "ring-rose-200/60",
        hover: "group-hover:shadow-[0_14px_28px_rgba(244,63,94,0.18)]",
      };
    case "amber":
      return {
        blob: "bg-gradient-to-br from-amber-600 to-orange-500",
        ring: "ring-amber-200/60",
        hover: "group-hover:shadow-[0_14px_28px_rgba(245,158,11,0.18)]",
      };
    default:
      return {
        blob: "bg-gradient-to-br from-slate-700 to-slate-500",
        ring: "ring-slate-200/60",
        hover: "group-hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)]",
      };
  }
}

export default function QuickActions({ disabledKeys = [] }) {
  const navigate = useNavigate();

  const items = useMemo(() => {
    return ACTIONS.map((a) => ({
      ...a,
      disabled: disabledKeys.includes(a.key),
    }));
  }, [disabledKeys]);

  return (
    <section>
      {/* ===== Enterprise Container ===== */}
      <div
        className="
          relative overflow-hidden rounded-3xl border border-gray-200
          bg-gradient-to-r from-blue-50 via-slate-50 to-cyan-50
          shadow-[0_18px_45px_rgba(0,0,0,0.08)]
        "
      >
        {/* soft glow accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="relative p-4 sm:p-5">
          {/* ===== Header ===== */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Quick Actions
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Common tasks for faster flight operations
              </p>
            </div>

            <span
              className="
                inline-flex items-center gap-2 rounded-full border border-white/40
                bg-white/60 px-3 py-1 text-[11px] font-medium text-gray-700
                shadow-sm backdrop-blur
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Agent tools ready
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            </span>
          </div>

          {/* ===== Cards ===== */}
          {/* Desktop grid: clean 6 columns | Mobile: scrollable row so cards don't squeeze */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {items.map((a) => (
              <ActionCard
                key={a.key}
                a={a}
                onClick={() => !a.disabled && navigate(a.route)}
              />
            ))}
          </div>

          {/* Mobile/Tablet scroll row (looks much more premium than squeezed grid) */}
          <div className="md:hidden -mx-2 px-2">
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map((a) => (
                <div key={a.key} className="min-w-[170px]">
                  <ActionCard
                    a={a}
                    onClick={() => !a.disabled && navigate(a.route)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionCard({ a, onClick }) {
  const Icon = a.icon;
  const t = toneClasses(a.tone);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={a.disabled}
      title={a.disabled ? a.disabledReason : a.desc}
      className={[
        "group relative w-full text-left",
        "rounded-2xl border bg-white/90 backdrop-blur",
        "border-gray-200 hover:border-gray-300",
        "shadow-[0_8px_20px_rgba(0,0,0,0.06)]",
        "transition-all",
        "p-4",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-2 focus:ring-offset-transparent",
        a.disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5",
        !a.disabled ? t.hover : "",
      ].join(" ")}
    >
      {/* soft ring */}
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-2xl ring-1",
          t.ring,
          "opacity-0 group-hover:opacity-100 transition",
        ].join(" ")}
      />

      {/* Disabled overlay */}
      {a.disabled && (
        <div className="absolute inset-0 rounded-2xl bg-white/50" />
      )}

      <div className="relative flex h-full flex-col">
        {/* Top: Icon + Tag */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={[
              "grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm",
              t.blob,
            ].join(" ")}
          >
            <Icon size={20} />
          </span>

          {a.primary ? (
            <span
              className="
                inline-flex items-center rounded-full border border-blue-200/70
                bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700
              "
            >
              Recommended
            </span>
          ) : (
            <span className="h-6" />
          )}
        </div>

        {/* Middle: Title + Desc */}
        <div className="mt-3">
          <div className="text-sm font-semibold text-gray-900 leading-snug">
            {a.label}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
            {a.disabled ? a.disabledReason || a.desc : a.desc}
          </div>
        </div>

        {/* Bottom: CTA */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          <span
            className={[
              "inline-flex items-center gap-1.5",
              a.disabled ? "text-gray-400" : "text-blue-700",
            ].join(" ")}
          >
            Open
            <ArrowRight
              className={[
                "h-3.5 w-3.5 transition",
                a.disabled ? "" : "group-hover:translate-x-0.5",
              ].join(" ")}
            />
          </span>

          <div className="ml-auto" />
        </div>
      </div>
    </button>
  );
}
