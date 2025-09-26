import FromToBar from "./FromToBar";

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
    alert(`Searching...\n${JSON.stringify(payload, null, 2)}`);
  };



  return (
    <section className="max-w-[90rem] mx-auto px-4 py-7">

      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-black leading-tight">
              Let's Travel The
              <span className="block">World with us</span>
            </h1>
          </div>

          <div className="relative">
            <div className="lg:block">
              <img
                src="https://uiparadox.co.uk/templates/flynow/assets/media/banner/plane.png"
                alt="world landmarks collage"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] shadow-[0_20px_50px_-5px_rgba(0,0,0,0.25)] p-4 bg-white">
        <FromToBar onSearch={onSearch} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Special Fares (Optional):</span>
          {["Student", "Senior Citizen", "Armed Forces"].map(x => (
            <button key={x} className="chip shadow-[0_20px_50px_-5px_rgba(0,0,0,0.25)] border-gray-200">{x}</button>
          ))}
          <span className="ml-auto hidden md:flex items-center gap-2 muted">
            <span className="pill bg-emerald-50 text-emerald-700">Hassle-Free Bookings</span>
          </span>
        </div>
        <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-4 text-sm" role="region" aria-label="Free Cancellation Options">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="freeCancelCheckbox" />
            <span>Always opt for Free Cancellation</span>
          </label>

          <span className="muted">₹0 cancellation fee</span>
          <span className="muted">No-questions-asked instant refunds</span>
          <span className="muted">Priority customer service</span>

          <span className="ml-auto">
            <span className="shield" aria-hidden="true">🛡️</span>
          </span>
        </div>

      </div>
    </section>
  );
}
