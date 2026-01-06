// src/components/offers/MonthlyTargetOfferModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import offerImg from "../../assets/offer/offer.png";

const LS_KEY = "OFFER_MODAL_MONTHLY_TARGET_ONCE_V2";

function safeGetSeen() {
  try {
    return localStorage.getItem(LS_KEY) === "1";
  } catch {
    return false;
  }
}

function safeSetSeen() {
  try {
    localStorage.setItem(LS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export default function MonthlyTargetOfferModal({
  open, // optional controlled
  onClose,
  autoOpen = false,
  imageUrl,
  alt = "Monthly Target Offer",
}) {
  const [seen, setSeen] = useState(() => safeGetSeen());
  const [visible, setVisible] = useState(false);

  // If already seen => NEVER show again (even if parent passes open=true)
  const blocked = useMemo(() => seen === true, [seen]);

  // Controlled open sync (but gated by "seen")
  useEffect(() => {
    if (blocked) return;

    if (typeof open === "boolean") {
      setVisible(open);
    }
  }, [open, blocked]);

  // Auto-open once (gated by "seen")
  useEffect(() => {
    if (blocked) return;
    if (!autoOpen) return;

    // only auto-open if parent isn't explicitly controlling open=false
    if (typeof open === "boolean" && open === false) return;

    setVisible(true);
  }, [autoOpen, open, blocked]);

  // Mark as seen the moment it becomes visible
  useEffect(() => {
    if (!visible) return;
    if (blocked) return;

    safeSetSeen();
    setSeen(true);
  }, [visible, blocked]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // ESC close
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  if (blocked || !visible) return null;

  const src = imageUrl || offerImg;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Offer"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Image-only Modal */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-md shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close offer"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
        >
          <X className="h-4 w-4" />
        </button>

        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
