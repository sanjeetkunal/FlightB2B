import FromToBar from "./flightsearch/FromToBar";
import flightImg from '../assets/media/flight.png'
import cloudImg from '../assets/media/cloud.png'
import ifs from "../assets/media/ifs.webp";

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
    alert(`Searching...\n${JSON.stringify(payload, null, 2)}`);
  };



  return (
    <section className="mx-auto max-w-7xl py-7">
      <div className="mx-auto mb-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl text-black leading-tight font-semibold text-center sm:text-left">
              Let's <span className="text-black not-italic">Travel</span> The
              <span className="block"><span className="text-blue-500  font-bold not-italic">World</span> with us</span>
            </h1>
          </div>

          <div className="relative">
            <div className="lg:block">
              <img src={cloudImg} className="w-full h-full object-contain absolute z-[-1]" />
              <img
                src={flightImg}
                alt="world landmarks collage"
                className=" hidden sm:block w-full h-full object-cover transform transition-transform duration-300 ease-out hover:scale-105"
              />

       
              {/* Desktop */}
              <img
                src={ifs}
                alt="world landmarks collage"
                className="block sm:hidden w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-gray-200 p-4 bg-white">
        <FromToBar onSearch={onSearch} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Special Fares (Optional):</span>
          {["Student", "Senior Citizen", "Armed Forces"].map(x => (
            <button key={x} className="chip border-gray-200">{x}</button>
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
