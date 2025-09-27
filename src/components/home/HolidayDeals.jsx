import holdinhand from "../../assets/media/holdinhand.png";
import uri from "../../assets/media/uri.webp";

export default function HolidayDeals() {
  return (
    <section className="max-w-[90rem] mx-auto px-4 py-7">
    <div className="flex flex-col md:flex-row gap-4">
      {/* Left card */}
      <div className="bg-slate-300 rounded-xl flex flex-col justify-between p-6 w-full md:w-1/2 relative overflow-hidden h-[210px]">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Fly away to your dream holiday
          </h1>
          <p className="text-gray-800 mt-2 w-full sm:w-[300px]">
            Get inspired, compare and book flights with more flexibility
          </p>
        </div>
        <button className="mt-6 bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md w-fit">
          Search for flights
        </button>
        <img src={holdinhand} alt="Holding Hand" className="mt-4 w-[200px] h-auto absolute right-0 top-0" />
      </div>

      {/* Right card */}
      <div className="bg-gray-100 rounded-xl flex flex-col justify-between p-6 w-full md:w-1/2 bg-cover bg-center"
           style={{ backgroundImage: uri ? `url(${uri})` : undefined }}>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Seize the moment
          </h2>
          <p className="text-gray-800 mt-2 w-full sm:w-[300px]">
            Save 15% or more when you book and stay before 1 October 2026
          </p>
        </div>
        <button className="mt-6 bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md w-fit">
          Find gateway deals
        </button>
      </div>
    </div>
    </section>
  );
}
