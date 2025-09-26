const items = [
  { title: "Flight Tracker", badge: "Pro", icon: "🧭" },
  { title: "Credit Card",    badge: "Free", icon: "💳" },
  { title: "Book Visa",                      icon: "🛂" },
  { title: "Travel Insurance",               icon: "🤝" },
  { title: "Group Booking",                  icon: "👥" },
  { title: "Airport Cabs",                   icon: "🚕" },
  { title: "Plan",                           icon: "🗓️" },
  { title: "Fare Alerts",                    icon: "🔔" },
];

export default function DoMore() {
  return (
    <section className="max-w-[90rem] mx-auto px-4 pb-10">
      <h3 className="text-lg font-semibold mb-3">Do More With V2A</h3>
      <div className="bg-white  rounded-[22px] border border-gray-200 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={[
                "flex flex-col items-center gap-2 py-5",
                i % 1 === 0 ? "" : "",
                i !== 0 ? "md:border-l" : "",
                "border-gray-200",
              ].join(" ")}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl grid place-items-center border text-blue-700">
                  <span className="text-xl">{it.icon}</span>
                </div>
                {it.badge && (
                  <span
                    className={`absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      it.badge === "Pro"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {it.badge}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-800 text-center">{it.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
