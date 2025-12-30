// src/components/common/ShareMenu.tsx
import React, { useState } from "react";
import { share, type ShareChannel, type SharePayload } from "../../utils/shareFlight";

type Props = {
  payload: SharePayload;
  className?: string;
  compact?: boolean;
};

export default function ShareMenu({ payload, className = "", compact = true }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ShareChannel | null>(null);

  const run = async (ch: ShareChannel) => {
    try {
      setBusy(ch);
      await share(payload, ch);
      setOpen(false);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
          "bg-white hover:bg-gray-50",
        ].join(" ")}
        title="Share"
      >
        <span>{compact ? "Share" : "Share Flight"}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close share menu overlay"
          />
          <div className="absolute right-0 mt-2 z-50 w-48 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => run("wa")}
              disabled={!!busy}
              className="w-full px-3 py-2 text-left text-[12px] font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              {busy === "wa" ? "Opening…" : "WhatsApp"}
            </button>

            <button
              type="button"
              onClick={() => run("email")}
              disabled={!!busy}
              className="w-full px-3 py-2 text-left text-[12px] font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              {busy === "email" ? "Opening…" : "Email"}
            </button>

            <button
              type="button"
              onClick={() => run("copy")}
              disabled={!!busy}
              className="w-full px-3 py-2 text-left text-[12px] font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              {busy === "copy" ? "Copying…" : "Copy Link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
