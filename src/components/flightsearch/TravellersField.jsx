import FieldShell from "../flightsearch/FieldShell";

export default function TravellersField({ label, text, onClick }) {
  return (
    <FieldShell label={label}>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left bg-transparent text-[16px] font-semibold outline-none cursor-pointer"
      >
        {text || "Select Travellers"}
      </button>
    </FieldShell>
  );
}
