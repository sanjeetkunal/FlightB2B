import React, { useEffect, useMemo, useState } from "react";
import {
  Plane,
  Hotel,
  Home,
  Umbrella,
  Train,
  Bus,
  Sparkles,
  FileText,
  Ship,
  Wallet,
  ShieldCheck,
} from "lucide-react";

interface ModuleNavProps {
  activeProduct?: string;
  onProductChange?: (product: string) => void;
  tripType?: string;
  onTripTypeChange?: (tripType: string) => void;
  rightText?: string;
}

export default function ModuleNav({
  activeProduct,
  onProductChange,
  tripType,
  onTripTypeChange,
  rightText = "Book International and Domestic Flights",
}: ModuleNavProps) {
  const products = useMemo(
    () => [
      { key: "flights", label: "Flights", icon: Plane },
      { key: "hotels", label: "Hotels", icon: Hotel },
      { key: "trains", label: "Trains", icon: Train },
      { key: "buses", label: "Buses", icon: Bus },
      { key: "tours", label: "Tours", icon: Sparkles, badge: "new" },
    ],
    []
  );

  const [localProduct, setLocalProduct] = useState(activeProduct || "flights");
  const [localTrip, setLocalTrip] = useState(tripType || "roundtrip");

  useEffect(() => {
    if (activeProduct != null) setLocalProduct(activeProduct);
  }, [activeProduct]);

  useEffect(() => {
    if (tripType != null) setLocalTrip(tripType);
  }, [tripType]);

  const setProduct = (k: string) => {
    setLocalProduct(k);
    onProductChange?.(k);
  };

  const setTrip = (k: string) => {
    setLocalTrip(k);
    onTripTypeChange?.(k);
  };

  const tabBase =
    "relative flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-[12px] sm:text-[13px] transition";
  const tripBase =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] sm:text-[13px] transition border";

  return (
    <div
      className="relative"
      style={{
        background: "color-mix(in srgb, var(--surface) 82%, transparent)",
      }}
    >
      {/* Product Tabs */}
      <div
        className="flex items-stretch gap-1 overflow-x-auto px-2 py-2 sm:px-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {products.map((p) => {
          const Icon = p.icon;
          const active = localProduct === p.key;

          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setProduct(p.key)}
              className={[tabBase, "border", active ? "" : "opacity-80 hover:opacity-100"].join(" ")}
              style={{
                borderColor: "var(--border)",
                background: active
                  ? "color-mix(in srgb, var(--surface2) 88%, transparent)"
                  : "color-mix(in srgb, var(--surface) 78%, transparent)",
                color: "var(--text)",
              }}
            >
              <span
                className="grid place-items-center rounded-md"
                style={{
                  width: 28,
                  height: 28,
                  background: "color-mix(in srgb, var(--surface2) 85%, transparent)",
                  border: "1px solid var(--border)",
                }}
              >
                <Icon size={16} style={{ color: active ? "var(--primary)" : "var(--muted)" }} />
              </span>

              <span className="leading-[1.05] whitespace-pre-line text-left">{p.label}</span>

              {p.badge ? (
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: "var(--primarySoft)",
                    color: "var(--primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {p.badge}
                </span>
              ) : null}

              {active ? (
                <span
                  className="absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

     
    </div>
  );
}
