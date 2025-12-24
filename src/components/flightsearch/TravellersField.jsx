// components/flightsearch/TravellersField.jsx
import FieldShell from "./FieldShell";

export default function TravellersField({ label, text = "", onClick }) {
  // text example: "2 Travellers, Economy"
  const [countPart, classPart] = text.split(",").map(s => s?.trim());

  return (
    <FieldShell label={label}>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left min-w-0 cursor-pointer"
      >
        {/* Travellers count */}
        <div className="text-[18px] leading-6 font-bold text-slate-900 truncate">
          {countPart || "Select Travellers"}
        </div>

        {/* Cabin / Class */}
        <div className="text-[12px] text-slate-500 truncate">
          {classPart || ""}
        </div>
      </button>
    </FieldShell>
  );
}
