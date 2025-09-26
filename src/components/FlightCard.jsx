export default function FlightCard({ data, onBook }) {
  const { airline, from, to, dep, arr, dur, stops = 0, price = 0, baggage = "-" } = data;
  return (
    <div className="bg-white border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="md:w-1/3">
        <div className="font-semibold">{airline}</div>
        <div className="text-sm text-gray-500">{stops === 0 ? "Non-stop" : `${stops} stop`}</div>
      </div>
      <div className="md:flex-1 grid grid-cols-3 items-center text-center">
        <div>
          <div className="text-lg font-semibold">{dep}</div>
          <div className="text-xs text-gray-500">{from}</div>
        </div>
        <div className="text-xs text-gray-500">{dur}</div>
        <div>
          <div className="text-lg font-semibold">{arr}</div>
          <div className="text-xs text-gray-500">{to}</div>
        </div>
      </div>
      <div className="md:w-48 text-right md:text-left md:ml-auto">
        <div className="text-xl font-bold">₹{Number(price).toLocaleString("en-IN")}</div>
        <div className="text-xs text-gray-500">Baggage: {baggage}</div>
        <button onClick={onBook} className="btn-primary mt-2 w-full">Book</button>
      </div>
    </div>
  );
}
