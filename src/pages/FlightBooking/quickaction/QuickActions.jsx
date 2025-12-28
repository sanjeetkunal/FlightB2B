// QuickActions.jsx (theme-driven)
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
    tone: "primary",
  },
  {
    key: "book_hold",
    label: "Book & Hold",
    icon: PauseCircle,
    route: "/book-hold",
    desc: "Reserve fare without ticketing",
    disabledReason: "Insufficient credit limit",
    tone: "neutral",
  },
  {
    key: "issue",
    label: "Issue Ticket",
    icon: Ticket,
    route: "/issue",
    desc: "Confirm & issue ticket",
    tone: "accent",
  },
  {
    key: "reschedule",
    label: "Reschedule",
    icon: RefreshCcw,
    route: "/reschedule",
    desc: "Modify travel dates",
    tone: "success",
  },
  {
    key: "cancel",
    label: "Cancel Booking",
    icon: XCircle,
    route: "/cancel",
    desc: "Cancel issued ticket",
    tone: "danger",
  },
  {
    key: "refund",
    label: "Refund Status",
    icon: Wallet,
    route: "/refunds",
    desc: "Track refund progress",
    tone: "warning",
  },
];

/* ---------- color helpers ---------- */
function clampHex(hex) {
  if (!hex) return null;
  let h = String(hex).trim();
  if (!h) return null;
  if (!h.startsWith("#")) h = `#${h}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return null;
  if (h.length === 4) {
    const r = h[1], g = h[2], b = h[3];
    h = `#${r}${r}${g}${g}${b}${b}`;
  }
  return h.toLowerCase();
}

function parseCssColor(input) {
  const s = String(input || "").trim();
  if (!s) return null;

  const hx = clampHex(s);
  if (hx) {
    const h = hx.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const m = s.match(
    /rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)/
  );
  if (m) {
    return {
      r: Math.max(0, Math.min(255, Number(m[1]))),
      g: Math.max(0, Math.min(255, Number(m[2]))),
      b: Math.max(0, Math.min(255, Number(m[3]))),
    };
  }
  return null;
}

function rgba(rgb, a) {
  if (!rgb) return `rgba(0,0,0,${a})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function isDarkSurface() {
  const s = parseCssColor(getVar("--surface")) || { r: 255, g: 255, b: 255 };
  return s.r < 40 && s.g < 40 && s.b < 60;
}

/* ---------- Component ---------- */
export default function QuickActions({ disabledKeys = [] }) {
  const navigate = useNavigate();
  const [themeFx, setThemeFx] = useState({
    leftWash: "radial-gradient(70% 110% at 0% 40%, rgba(37,99,235,0.12), transparent 65%)",
    rightWash: "radial-gradient(70% 110% at 100% 50%, rgba(16,182,217,0.10), transparent 62%)",
    bottom: "linear-gradient(to top, rgba(2,6,23,0.03), transparent 60%)",
    badgeBg: "rgba(255,255,255,0.60)",
    badgeBorder: "rgba(255,255,255,0.40)",
    badgeDot: "rgba(34,197,94,1)",
    badgeIcon: "rgba(16,182,217,1)",
    focusRing: "rgba(16,182,217,0.45)",
  });

  const recompute = useCallback(() => {
    const primary = parseCssColor(getVar("--primary")) || { r: 16, g: 182, b: 217 };
    const accent = parseCssColor(getVar("--accent")) || primary;

    const dark = isDarkSurface();
    const L = dark ? 0.16 : 0.12;
    const R = dark ? 0.14 : 0.10;
    const B = dark ? 0.06 : 0.03;

    setThemeFx({
      leftWash: `radial-gradient(70% 110% at 0% 40%, ${rgba(primary, L)}, transparent 65%)`,
      rightWash: `radial-gradient(70% 110% at 100% 50%, ${rgba(accent, R)}, transparent 62%)`,
      bottom: `linear-gradient(to top, rgba(2,6,23,${B}), transparent 60%)`,
      badgeBg: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)",
      badgeBorder: dark ? "rgba(231,238,252,0.14)" : "rgba(255,255,255,0.40)",
      badgeDot: getVar("--success") || "rgba(34,197,94,1)",
      badgeIcon: rgba(primary, 1),
      focusRing: rgba(primary, 0.45),
    });
  }, []);

  useEffect(() => {
    recompute();
    const root = document.documentElement;
    const obs = new MutationObserver(recompute);
    obs.observe(root, { attributes: true, attributeFilter: ["style", "class"] });
    return () => obs.disconnect();
  }, [recompute]);

  const items = useMemo(() => {
    return ACTIONS.map((a) => ({
      ...a,
      disabled: disabledKeys.includes(a.key),
    }));
  }, [disabledKeys]);

  return (
    <section>
      <div
        className="
          relative overflow-hidden rounded-3xl border
          bg-[var(--surface)]/85 border-[var(--border)]
          shadow-[0_18px_45px_rgba(0,0,0,0.08)]
        "
      >
        {/* ✅ screenshot jaisa left/right light wash (theme-driven) */}
        <div className="pointer-events-none absolute inset-0" style={{ background: themeFx.leftWash }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: themeFx.rightWash }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: themeFx.bottom }} />

        <div className="relative p-4 sm:p-5">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Quick Actions</h3>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Common tasks for faster flight operations
              </p>
            </div>

            <span
              className="
                inline-flex items-center gap-2 rounded-full border
                px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur
              "
              style={{
                background: themeFx.badgeBg,
                borderColor: themeFx.badgeBorder,
                color: "var(--text)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: themeFx.badgeDot }} />
              Agent tools ready
              <Sparkles className="h-3.5 w-3.5" style={{ color: themeFx.badgeIcon }} />
            </span>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {items.map((a) => (
              <ActionCard
                key={a.key}
                a={a}
                onClick={() => !a.disabled && navigate(a.route)}
                focusRing={themeFx.focusRing}
              />
            ))}
          </div>

          {/* Mobile scroll row */}
          <div className="md:hidden -mx-2 px-2">
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map((a) => (
                <div key={a.key} className="min-w-[170px]">
                  <ActionCard
                    a={a}
                    onClick={() => !a.disabled && navigate(a.route)}
                    focusRing={themeFx.focusRing}
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

function toneToVars(tone) {
  const primary = getVar("--primary") || "#10b6d9";
  const accent = getVar("--accent") || primary;
  const success = getVar("--success") || "#22c55e";
  const warning = getVar("--warning") || "#f59e0b";
  const danger = getVar("--danger") || "#ef4444";

  switch (tone) {
    case "accent":
      return { a: accent, b: primary };
    case "success":
      return { a: success, b: primary };
    case "warning":
      return { a: warning, b: primary };
    case "danger":
      return { a: danger, b: primary };
    case "neutral":
      return { a: getVar("--text") || "#0b1220", b: getVar("--muted") || "#667085" };
    case "primary":
    default:
      return { a: primary, b: accent };
  }
}

function ActionCard({ a, onClick, focusRing }) {
  const Icon = a.icon;

  // per-tone gradient blob (theme-driven)
  const { a: c1, b: c2 } = toneToVars(a.tone);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={a.disabled}
      title={a.disabled ? a.disabledReason : a.desc}
      className={[
        "group relative w-full text-left",
        "rounded-2xl border backdrop-blur",
        "bg-[var(--surface)]/90 border-[var(--border)]",
        "shadow-[0_8px_20px_rgba(0,0,0,0.06)]",
        "transition-all p-4",
        a.disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5",
      ].join(" ")}
      style={{
        outline: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${focusRing}, 0 8px 20px rgba(0,0,0,0.06)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
      }}
    >
      {/* hover ring */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
        style={{
          boxShadow: `inset 0 0 0 1px ${getVar("--border") || "rgba(15,23,42,0.12)"}`,
          background: `linear-gradient(135deg, ${getVar("--primarySoft") || "rgba(16,182,217,0.14)"}, transparent 55%)`,
        }}
      />

      {a.disabled && <div className="absolute inset-0 rounded-2xl bg-[var(--surface)]/40" />}

      <div className="relative flex h-full flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm"
            style={{
              backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})`,
            }}
          >
            <Icon size={20} />
          </span>

        </div>

        {/* Title */}
        <div className="mt-3">
          <div className="text-sm font-semibold text-[var(--text)] leading-snug">{a.label}</div>
          <div className="mt-1 text-[11px] text-[var(--muted)] line-clamp-2">
            {a.disabled ? a.disabledReason || a.desc : a.desc}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: a.disabled ? "var(--muted)" : "var(--primary)" }}
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
