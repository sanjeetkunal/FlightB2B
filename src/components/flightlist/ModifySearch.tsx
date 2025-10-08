import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FromToBar from "../flightsearch/FromToBar";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ModifySearch({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // FromToBar → onSearch payload ko querystring me map karo
  const handleModifySearch = (payload: any) => {
    // pax calc
    const adults   = Number(payload?.adults ?? payload?.pax?.adults ?? 1);
    const children = Number(payload?.children ?? payload?.pax?.children ?? 0);
    const infants  = Number(payload?.infants ?? payload?.pax?.infants ?? 0);
    const pax = Math.max(1, adults + children + infants);

    const from = payload?.from?.code ?? payload?.fromIata ?? payload?.from ?? "";
    const to   = payload?.to?.code   ?? payload?.toIata   ?? payload?.to   ?? "";
    const date = payload?.depart     ?? payload?.departDate ?? "";
    const cabin = payload?.cabin ?? payload?.class ?? "Economy";

    const qs = new URLSearchParams({
      from: String(from).toUpperCase(),
      to:   String(to).toUpperCase(),
      date: date || "",
      cabin,
      pax: String(pax),
    });

    // results route par navigate (same page bhi ho sakta hai)
    navigate(`${pathname}?${qs.toString()}`);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="sticky top-0 z-40 mb-3 backdrop-blur">
      <div className="mx-auto max-w-7xl">
        {/* IMPORTANT: FromToBar ke button par onClick={handleSearch} hi ho */}
        <FromToBar onSearch={handleModifySearch} />
      </div>
    </div>
  );
}
