import FromToBar from "./FromToBar";
import flightImg from '../assets/media/flight.png'
import cloudImg from '../assets/media/cloud.png'

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
    alert(`Searching...\n${JSON.stringify(payload, null, 2)}`);
  };



  return (
    <section className="max-w-[90rem] mx-auto px-4 py-7">
      {/* <div class="vector-image absolute mx-auto max-w-[60rem]">
        <svg xmlns="http://www.w3.org/2000/svg" width="1414" height="319" viewBox="0 0 1414 319" fill="none">
          <path class="path" d="M-0.5 215C62.4302 220.095 287 228 373 143.5C444.974 72.7818 368.5 -3.73136 320.5 1.99997C269.5 8.08952 231.721 43.5 253.5 119C275.279 194.5 367 248.212 541.5 207.325C675.76 175.867 795.5 82.7122 913 76.7122C967.429 73.9328 1072.05 88.6813 1085 207.325C1100 344.712 882 340.212 922.5 207.325C964.415 69.7967 1354 151.5 1479 183.5" stroke="#ECECF2" stroke-width="6" stroke-linecap="round" stroke-dasharray="round"></path>

          <path class="dashed" d="M-0.5 215C62.4302 220.095 287 228 373 143.5C444.974 72.7818 368.5 -3.73136 320.5 1.99997C269.5 8.08952 231.721 43.5 253.5 119C275.279 194.5 367 248.212 541.5 207.325C675.76 175.867 795.5 82.7122 913 76.7122C967.429 73.9328 1072.05 88.6813 1085 207.325C1100 344.712 882 340.212 922.5 207.325C964.415 69.7967 1354 151.5 1479 183.5" stroke="#212627" stroke-width="6" stroke-linecap="round" stroke-dasharray="22 22"></path>
        </svg>
        <div class="location-image">
          <img src="assets/media/icons/location-blue.png" alt="" />
        </div>
      </div> */}
      <div className="mx-auto mb-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl text-black leading-tight font-semibold">
              Let's <span className="text-black not-italic">Travel</span> The
              <span className="block"><span className="text-amber-500  font-bold not-italic">World</span> with us</span>
            </h1>
          </div>

          <div className="relative">
            <div className="lg:block">
              <img src={cloudImg}  className="w-full h-full object-contain absolute z-[-1]"/>
              <img
                src={flightImg}
                alt="world landmarks collage"
                className="w-full h-full object-cover transform transition-transform duration-300 ease-out hover:scale-105"
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
