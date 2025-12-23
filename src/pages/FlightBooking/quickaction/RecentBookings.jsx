export default function RecentBookings() {
  const bookings = [
    {
      pnr: "AD4K9Q",
      route: "DEL → BOM",
      pax: "2 Pax",
      amount: "₹12,450",
      status: "Ticketed",
      statusTone: "green",
      meta: "IndiGo • Today 11:40 AM",
    },
    {
      pnr: "K8LM2P",
      route: "BOM → DXB",
      pax: "1 Pax",
      amount: "₹22,890",
      status: "On Hold",
      statusTone: "yellow",
      meta: "Air India • Yesterday 6:15 PM",
    },
    {
      pnr: "Q1TZ8N",
      route: "BLR → SIN",
      pax: "3 Pax",
      amount: "₹54,120",
      status: "Cancelled",
      statusTone: "red",
      meta: "Singapore Airlines • 2 days ago",
    },
  ];

  return (
    <div
      className="
        relative rounded-3xl p-[1px]
        bg-gradient-to-br from-blue-200/60 via-cyan-200/40 to-emerald-200/60
        shadow-[0_18px_45px_rgba(0,0,0,0.08)]
      "
    >
      <div className="rounded-3xl border border-white/70 bg-white/85 backdrop-blur-xl p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Recent Bookings
            </h4>
            <p className="mt-1 text-xs text-gray-500">
              Latest PNR activity with quick status overview.
            </p>
          </div>

          <button
            type="button"
            className="
              text-xs font-semibold text-blue-700
              hover:text-blue-800 transition
            "
          >
            View All
          </button>
        </div>

        {/* List */}
        <div className="mt-4 space-y-3">
          {bookings.map((b) => (
            <BookingRow key={b.pnr} b={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingRow({ b }) {
  const badgeClass =
    b.statusTone === "green"
      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
      : b.statusTone === "yellow"
      ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
      : "bg-gradient-to-r from-rose-500 to-red-500 text-white";

  return (
    <button
      type="button"
      className="
        group w-full rounded-2xl border border-gray-200/80
        bg-white px-4 py-3 text-left
        hover:border-blue-200
        hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-cyan-50/40
        hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]
        transition
      "
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {b.route}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{b.pax}</span>
          </div>

          <div className="mt-1 text-xs text-gray-500 truncate">
            {b.meta}
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-gray-600">
            <span>
              PNR: <span className="text-gray-900">{b.pnr}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span>
              Amount: <span className="text-gray-900">{b.amount}</span>
            </span>
          </div>
        </div>

        {/* Status */}
        <span
          className={`
            shrink-0 rounded-full px-3 py-1
            text-[11px] font-semibold
            shadow-sm
            ${badgeClass}
          `}
        >
          {b.status}
        </span>
      </div>

      {/* subtle bottom accent */}
      <div className="pointer-events-none mt-3 h-[2px] w-0 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
    </button>
  );
}
