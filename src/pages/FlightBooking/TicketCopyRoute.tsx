// src/pages/TicketCopyRoute.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TicketCopyPage from "./TicketCopyPage";

const TICKET_SS_KEY = "TICKET_CTX_V1";

function safeParse(json: string | null) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export default function TicketCopyRoute() {
  const nav = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const ticket = useMemo(() => {
    const fromState = (location.state as any)?.ticket || null;
    const fromSS = safeParse(sessionStorage.getItem(TICKET_SS_KEY));
    return fromState ?? fromSS ?? null;
  }, [location.state]);

  // keep in sessionStorage (refresh-safe)
  useEffect(() => {
    const fromState = (location.state as any)?.ticket || null;
    if (fromState) sessionStorage.setItem(TICKET_SS_KEY, JSON.stringify(fromState));
  }, [location.state]);

  // demo loader (API later)
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1200); // 1.2s nice feel
    return () => window.clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center">
              <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Confirming your booking
              </div>
              <div className="mt-0.5 text-xs text-slate-600">
                Please wait… generating ticket copy
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/2 bg-slate-900/10 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-500">
              Do not refresh or close this page.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">No ticket found</div>
          <div className="mt-1 text-xs text-slate-600">Please complete payment again.</div>
          <button
            onClick={() => nav("/flights")}
            className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return <TicketCopyPage ticket={ticket} onBack={() => nav(-1)} />;
}
