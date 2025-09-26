import FlightCard from "../components/FlightCard";

export default function Results() {
  const dummy = [
    { id: 1, airline: "IndiGo", from: "DEL", to: "BOM", dep: "08:00", arr: "10:15", dur: "2h 15m", price: 5600 },
    { id: 2, airline: "Air India", from: "DEL", to: "BOM", dep: "12:00", arr: "14:30", dur: "2h 30m", price: 6100 },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <h2 className="text-xl font-semibold">Available Flights</h2>
      {dummy.map((f) => <FlightCard key={f.id} data={f} />)}
    </div>
  );
}
