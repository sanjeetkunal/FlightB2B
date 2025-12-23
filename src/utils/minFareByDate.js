// utils/minFareByDate.js
import { FLIGHTS } from "../data/flights";

function normCabin(c) {
  if (!c) return undefined;
  const v = String(c).toLowerCase().trim();
  const map = {
    economy: "Economy",
    eco: "Economy",
    "premium economy": "Premium Economy",
    premium: "Premium Economy",
    business: "Business",
    biz: "Business",
  };
  return map[v] || c;
}

/**
 * @returns {Record<string, number>}  // { "YYYY-MM-DD": minFareINR }
 */
export function buildMinFareByDate({ fromIata, toIata, cabin }) {
  const from = (fromIata || "").toUpperCase();
  const to = (toIata || "").toUpperCase();
  const cabinNorm = normCabin(cabin);

  const minByDate = {};

  for (const row of FLIGHTS) {
    if (row.fromIata !== from) continue;
    if (row.toIata !== to) continue;

    const fares = cabinNorm
      ? (row.fares || []).filter((f) => f.cabin === cabinNorm)
      : (row.fares || []);

    if (!fares.length) continue;

    const min = Math.min(...fares.map((f) => Number(f.totalINR)));
    const date = row.departDate; // YYYY-MM-DD

    if (!date) continue;

    if (minByDate[date] == null || min < minByDate[date]) {
      minByDate[date] = min;
    }
  }

  return minByDate;
}
