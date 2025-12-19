const routes = [
  { from: "DEL", to: "BOM" },
  { from: "BLR", to: "DEL" },
  { from: "BOM", to: "DXB" },
  { from: "DEL", to: "SIN" },
];

export default function PopularRoutes() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">
        Popular Agent Routes
      </h4>

      <div className="flex flex-wrap gap-2">
        {routes.map((r, i) => (
          <button
            key={i}
            className="
              rounded-full border px-3 py-1.5 text-xs font-medium
              hover:bg-blue-50 hover:border-blue-300 transition
            "
          >
            {r.from} → {r.to}
          </button>
        ))}
      </div>
    </div>
  );
}
