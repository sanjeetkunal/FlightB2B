import { motion } from "framer-motion";
import FromToBar from "./flightsearch/FromToBar";
import flightImg from "../assets/media/plane.gif";
import cloudImg from "../assets/media/cloud.png";
import ifs from "../assets/media/ifs.webp";
import RecentSearches from "./flightsearch/RecentSearches";
import QuickActions from "../pages/FlightBooking/quickaction/QuickActions";
import PopularRoutes from "../pages/FlightBooking/quickaction/PopularRoutes";
import RecentBookings from "../pages/FlightBooking/quickaction/RecentBookings";
// import AgentAlerts  from "../pages/FlightBooking/quickaction/AgentAlerts";

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
    // alert(`Searching...\n${JSON.stringify(payload, null, 2)}`);
  };

  // Common variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const fadeUpSlow = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.1 },
    },
  };

  return (
    <motion.section
      className="relative"
      initial="hidden"
      animate="visible" // PAGE LOAD animation
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
      }}
    >
      {/* Orange curved background (like reference) */}
      <div
        className="
          pointer-events-none
          absolute inset-x-0 -top-28
          h-[460px]
          bg-gradient-to-r from-[#3474c0] to-[#1c5db5]
          rounded-b-[0%]
          z-0 
        "
      />

      <div className="relative z-10 mx-auto max-w-7xl pb-8 px-4">
        <div className="mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* LEFT: Heading – page load pe fade-up */}
            <motion.div
              className="space-y-8"
              variants={fadeUp}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-5xl text-white leading-tight font-semibold text-center sm:text-left">


                <span className="text-white italic font-['Dancing_Script',cursive]" >Let’s Grow Your </span>
                <span className="block">
                  <span className="font-bold not-italic bg-gradient-to-r from-blue-300 to-cyan-200
           bg-clip-text text-transparent">
                    Travel Business Together
                  </span>{" "}
                </span>
              </h1>
            </motion.div>

            {/* RIGHT: Image – thoda delay ke sath */}
            <motion.div
              className="relative w-full h-full"
              variants={fadeUpSlow}
            >
              {/* Cloud background */}
              <img
                src={cloudImg}
                alt="clouds background"
                className="absolute inset-0 w-full h-full object-contain md:object-cover pointer-events-none z-0"
              />

              {/* Desktop / tablet flight image */}
              <img
                src={flightImg}
                alt="world landmarks collage"
                className="hidden sm:block w-70 object-contain transform transition-transform duration-300 ease-out hover:scale-105 relative z-10"
              />

            
            </motion.div>
          </div>
        </div>

        <motion.div
   className="
    relative mt-0 z-10 rounded-[22px]
    border border-white/50 bg-white/85 backdrop-blur
    shadow-[0_18px_40px_rgba(2,6,23,0.10)]
    overflow-visible
  "
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.4 }}
>
  {/* subtle gradient frame */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-90 rounded-[22px]" />
  <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

  {/* content */}
  <div className="rounded-[22px] relative p-4 sm:p-5 ">
    <FromToBar onSearch={onSearch} />

    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      <span className="text-sm font-semibold text-gray-800">
        Special Fares (Optional):
      </span>

      {["Student", "Senior Citizen", "Armed Forces"].map((x) => (
        <button
          key={x}
          type="button"
          className="
            rounded-full border border-gray-200 bg-white px-3 py-1.5
            text-xs font-semibold text-gray-700
            hover:border-blue-200 hover:bg-blue-50/50
            transition
          "
        >
          {x}
        </button>
      ))}

      <span className="ml-auto hidden md:flex items-center gap-2">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Hassle-Free Bookings
        </span>
      </span>
    </div>

    {/* Free cancellation bar (more premium) */}
    <div
      className="
        mt-3 flex flex-wrap items-center gap-3 rounded-2xl
        border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50
        px-3 py-2.5 text-sm
      "
      role="region"
      aria-label="Free Cancellation Options"
    >
      <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
        <input type="checkbox" id="freeCancelCheckbox" className="accent-blue-600" />
        <span>Always opt for Free Cancellation</span>
      </label>

      <span className="text-xs font-medium text-gray-600">₹0 cancellation fee</span>
      <span className="text-xs font-medium text-gray-600">Instant refunds</span>
      <span className="text-xs font-medium text-gray-600">Priority support</span>

      <span className="ml-auto inline-flex items-center gap-2">
        <span className="text-[11px] font-semibold text-blue-700">Protected</span>
        <img
          src="https://cdn-icons-gif.flaticon.com/17702/17702130.gif"
          alt="shield icon"
          className="h-9 w-9"
        />
      </span>
    </div>
  </div>
</motion.div>


        <RecentSearches />
       

        <div className="mt-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <PopularRoutes /> */}

            <QuickActions disabledKeys={["book_hold"]} />
            <RecentBookings />
            {/* <AgentAlerts /> */}
          </div>

        </div>
 
      </div>
    </motion.section>
  );
}
