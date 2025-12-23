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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Recent Bookings</h4>
          <p className="mt-1 text-xs text-gray-500">
            Latest PNR activity with quick status overview.
          </p>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-blue-700 hover:text-blue-800"
        >
          View All
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {bookings.map((b) => (
          <BookingRow key={b.pnr} b={b} />
        ))}
      </div>
    </div>
  );
}

function BookingRow({ b }) {
  const badgeClass =
    b.statusTone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : b.statusTone === "yellow"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <button
      type="button"
      className="
        w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left
        hover:bg-gray-50 transition
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{b.route}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{b.pax}</span>
          </div>

          <div className="mt-1 text-xs text-gray-500 truncate">{b.meta}</div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-600">
              PNR: <span className="text-gray-800">{b.pnr}</span>
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-[11px] font-semibold text-gray-600">
              Amount: <span className="text-gray-800">{b.amount}</span>
            </span>
          </div>
        </div>

        <span className={`shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full border ${badgeClass}`}>
          {b.status}
        </span>
      </div>
    </button>
  );
}
