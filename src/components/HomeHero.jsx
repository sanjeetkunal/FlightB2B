import { motion } from "framer-motion";
import FromToBar from "./flightsearch/FromToBar";
import flightImg from "../assets/media/flight.png";
import cloudImg from "../assets/media/cloud.png";
import ifs from "../assets/media/ifs.webp";

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
    alert(`Searching...\n${JSON.stringify(payload, null, 2)}`);
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

      {/* Actual content container */}
      <div className="relative z-10 mx-auto max-w-7xl pb-8">
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
              className="relative w-full h-full py-7"
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
                className="hidden sm:block w-full h-full object-cover transform transition-transform duration-300 ease-out hover:scale-105 relative z-10"
              />

              {/* Mobile fallback image */}
              <img
                src={ifs}
                alt="world landmarks collage"
                className="block sm:hidden w-full h-full object-cover relative z-10"
              />
            </motion.div>
          </div>
        </div>

        {/* Search card – SCROLL pe animate (whileInView) */}
        <motion.div
          className="rounded-[22px] border border-gray-200 p-4 bg-white shadow-sm mt-0 z-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"      // SCROLL animation
          viewport={{ once: true, amount: 0.4 }} // ek baar hi chalega, jab 40% card visible ho
        >
          <FromToBar onSearch={onSearch} />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Special Fares (Optional):</span>
            {["Student", "Senior Citizen", "Armed Forces"].map((x) => (
              <button key={x} className="chip border-gray-200">
                {x}
              </button>
            ))}
            <span className="ml-auto hidden md:flex items-center gap-2 muted">
              <span className="pill bg-emerald-50 text-emerald-700">
                Hassle-Free Bookings
              </span>
            </span>
          </div>

          <div
            className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-4 text-sm"
            role="region"
            aria-label="Free Cancellation Options"
          >
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="freeCancelCheckbox" />
              <span>Always opt for Free Cancellation</span>
            </label>

            <span className="muted">₹0 cancellation fee</span>
            <span className="muted">No-questions-asked instant refunds</span>
            <span className="muted">Priority customer service</span>

            <span className="ml-auto">
              <span className="shield" aria-hidden="true">
                🛡️
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
