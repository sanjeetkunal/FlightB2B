// components/flightsearch/TravellersField.jsx
import FieldShell from "./FieldShell";

export default function TravellersField({ label, text = "", onClick }) {
  const [countPart, classPart] = text.split(",").map((s) => s?.trim());

  return (
    <FieldShell label={label}>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left min-w-0 cursor-pointer"
      >
        <div className="text-[18px] leading-6 font-bold truncate text-[var(--text)]">
          {countPart || "Select Travellers"}
        </div>

        <div className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
          {classPart || ""}
        </div>
      </button>
    </FieldShell>
  );
}
