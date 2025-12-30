const routes = [
  { from: "DEL", to: "BOM", tag: "Top Seller" },
  { from: "BLR", to: "DEL", tag: "Daily Demand" },
  { from: "BOM", to: "DXB", tag: "International" },
  { from: "DEL", to: "SIN", tag: "High Margin" },
];

export default function PopularRoutes() {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            Popular Agent Routes
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            Quick shortcuts for high-demand sectors used by agents.
          </p>
        </div>

        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          View all
          <span aria-hidden>→</span>
        </button>
      </div>

      {/* Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {routes.map((r, i) => (
          <button
            key={i}
            type="button"
            className="
              group inline-flex items-center gap-2
              rounded-full border border-gray-200 bg-white
              px-3 py-2 text-xs font-semibold text-gray-700
              hover:border-blue-300 hover:bg-blue-50 transition
              shadow-[0_1px_0_rgba(0,0,0,0.03)]
            "
          >
            <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-gray-100 group-hover:bg-white">
              ✈️
            </span>

            <span className="tracking-wide">
              {r.from} <span className="text-gray-400">→</span> {r.to}
            </span>

            {r.tag && (
              <span className="ml-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                {r.tag}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer CTA (mobile) */}
      <button
        type="button"
        className="mt-4 w-full sm:hidden rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        View all routes →
      </button>
    </div>
  );
}
