// MainLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../components/chat/ChatWidget";

const OFFER_SEEN_KEY = "V2A_LOGIN_OFFER_SEEN_V1";

const VAR = {
  surface: "var(--surface, rgba(255,255,255,0.92))",
  surface2: "var(--surface2, rgba(248,250,252,0.92))",
  border: "var(--border, rgba(15,23,42,0.12))",
  text: "var(--text, rgba(15,23,42,0.92))",
  muted: "var(--muted, rgba(71,85,105,0.9))",
  subtle: "var(--subtle, rgba(100,116,139,0.85))",
  primary: "var(--primary, rgb(37,99,235))",
  primarySoft: "var(--primarySoft, rgba(37,99,235,0.14))",
  accent: "var(--accent, rgb(16,182,217))",
  accentSoft: "var(--accentSoft, rgba(16,182,217,0.12))",
  success: "var(--success, rgb(34,197,94))",
  warn: "var(--warn, rgb(245,158,11))",
};

function safeGetSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetSession(key, val) {
  try {
    sessionStorage.setItem(key, val);
  } catch {}
}

function LoginOfferModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    // prevent background scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleGradient = `linear-gradient(90deg, ${VAR.primary}, ${VAR.accent})`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Monthly Offer"
    >
      {/* overlay */}
      <button
        type="button"
        aria-label="Close offer"
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 20%, rgba(0,0,0,0.55), rgba(0,0,0,0.72))",
        }}
      />

      {/* modal */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-md shadow-2xl"
        style={{ background: VAR.surface, border: `1px solid ${VAR.border}` }}
      >
        {/* top glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
          style={{ background: VAR.primarySoft }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl"
          style={{ background: VAR.accentSoft }}
        />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: VAR.subtle }}
              >
                Monthly Agent Challenge
              </div>

              <h2
                className="mt-1 text-xl sm:text-2xl font-extrabold"
                style={{
                  backgroundImage: titleGradient,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                1500 Bookings &amp; Win iPhone 17 Pro
              </h2>

              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: VAR.muted }}>
                Is month agar aap <b>1500 successful bookings</b> complete karte ho, to aapko milega{" "}
                <b>iPhone 17 Pro</b> 🎉 <br />
                <span style={{ color: VAR.subtle }}>
                  (Enterprise promo • internal tracking / reports ke basis pe)
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md px-3 py-2 text-xs font-semibold"
              style={{ border: `1px solid ${VAR.border}`, background: VAR.surface2, color: VAR.text }}
            >
              Close
            </button>
          </div>

          {/* highlights */}
          <div
            className="mt-4 grid grid-cols-1 gap-2 rounded-md p-3"
            style={{ background: VAR.surface2, border: `1px solid ${VAR.border}` }}
          >
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: VAR.subtle }}>Target</span>
              <span className="font-semibold" style={{ color: VAR.text }}>
                1500 bookings / month
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: VAR.subtle }}>Reward</span>
              <span className="font-semibold" style={{ color: VAR.text }}>
                iPhone 17 Pro
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: VAR.subtle }}>Eligibility</span>
              <span className="font-semibold" style={{ color: VAR.text }}>
                Successful &amp; ticketed bookings
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md px-4 py-2.5 text-sm font-semibold"
              style={{
                background: VAR.primary,
                color: "white",
              }}
            >
              Let’s Start Booking
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2.5 text-sm font-semibold"
              style={{
                border: `1px solid ${VAR.border}`,
                background: VAR.surface2,
                color: VAR.text,
              }}
            >
              Remind me later
            </button>
          </div>

          <div className="mt-3 text-[11px]" style={{ color: VAR.subtle }}>
            Note: Offer terms can change as per company policy. Rewards subject to verification.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MainLayout({ variant = "private" }) {
  const location = useLocation();
  const [offerOpen, setOfferOpen] = useState(false);

  const isLoginPage = useMemo(() => {
    const p = (location?.pathname || "").toLowerCase();
    return p.includes("login");
  }, [location?.pathname]);

  useEffect(() => {
    if (!isLoginPage) return;

    const seen = safeGetSession(OFFER_SEEN_KEY);
    if (seen === "1") return;

    setOfferOpen(true);
  }, [isLoginPage]);

  const closeOffer = () => {
    safeSetSession(OFFER_SEEN_KEY, "1");
    setOfferOpen(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface2)] text-[var(--text)]">
      <Header variant={variant} />

      <main className="flex-1">
        <Outlet />
        <ChatWidget />
      </main>

      <Footer />

     
    </div>
  );
}
