export default function RecentBookings() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">
        Recent Bookings
      </h4>

      <div className="space-y-3 text-sm">
        <Row route="DEL → BOM" status="Ticketed" color="text-green-600" />
        <Row route="BOM → DXB" status="On Hold" color="text-yellow-600" />
        <Row route="BLR → SIN" status="Cancelled" color="text-red-600" />
      </div>
    </div>
  );
}

function Row({ route, status, color }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-gray-50 transition">
      <span>{route}</span>
      <span className={`text-xs font-semibold ${color}`}>{status}</span>
    </div>
  );
}
