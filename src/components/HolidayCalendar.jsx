import { useState } from "react";

const HOLIDAYS = [
  { date: "2025-10-02", name: "Mahatma Gandhi Jayanti" },
  { date: "2025-10-02", name: "Dussehra" }
];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function HolidayCalendar() {
  const [anchor, setAnchor] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(null);

  const months = [anchor, addMonths(anchor, 1)];
  const formatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

  const holidaysToday = HOLIDAYS.filter(h => selected && h.date === selected.toISOString().slice(0,10));

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setAnchor(addMonths(anchor, -1))}
          className="p-2 rounded hover:bg-gray-100"
        >‹</button>
        <button
          onClick={() => setAnchor(addMonths(anchor, 1))}
          className="p-2 rounded hover:bg-gray-100"
        >›</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {months.map((m, idx) => {
          const year = m.getFullYear();
          const month = m.getMonth();
          const firstDay = new Date(year, month, 1).getDay();
          const total = daysInMonth(year, month);

          const days = [];
          for (let i = 0; i < firstDay; i++) days.push(null);
          for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));

          while (days.length % 7 !== 0) days.push(null);

          return (
            <div key={idx}>
              <div className="text-center font-semibold mb-2">{formatter.format(m)}</div>
              <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d,i)=> {
                  const holiday = HOLIDAYS.find(h => d && h.date === d.toISOString().slice(0,10));
                  return (
                    <button
                      key={i}
                      disabled={!d}
                      onClick={()=> setSelected(d)}
                      className={[
                        "h-9 rounded text-sm",
                        d ? "hover:bg-gray-100" : "",
                        selected && isSameDay(d, selected) ? "bg-blue-600 text-white" : "",
                        holiday ? "border border-orange-400" : "",
                        !d && "cursor-default"
                      ].join(" ")}
                    >
                      {d ? d.getDate() : ""}
                    </button>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom holiday list */}
      <div className="flex gap-4 mt-4 border-t pt-3 overflow-x-auto">
        {HOLIDAYS.map((h, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border">
            <div className="w-7 h-7 rounded-full bg-yellow-200 grid place-items-center text-xs">🎉</div>
            <div>
              <div className="text-sm font-semibold">{h.name}</div>
              <div className="text-xs text-gray-500">{new Date(h.date).toDateString()}</div>
            </div>
          </div>
        ))}
        <a href="#" className="ml-auto text-sm text-orange-600 font-semibold">Holiday List ›</a>
      </div>
    </div>
  );
}
