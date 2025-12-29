// src/components/offers/MonthlyTargetOfferModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import offerImg from "../../assets/offer/offer.png";

const SS_KEY = "OFFER_MODAL_MONTHLY_TARGET_V1";

export default function MonthlyTargetOfferModal({
  open,
  onClose,
  autoOpen = false,
  imageUrl, // optional
  alt = "Monthly Target Offer",
}) {
  const [visible, setVisible] = useState(Boolean(open));

  // Sync controlled open
  useEffect(() => {
    setVisible(Boolean(open));
  }, [open]);

  // Optional auto-open (once/day)
  useEffect(() => {
    if (!autoOpen) return;
    try {
      const today = new Date();
      const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const last = sessionStorage.getItem(SS_KEY);
      if (last === key) return;
      sessionStorage.setItem(SS_KEY, key);
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [autoOpen]);

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

  if (!visible) return null;

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
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
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
