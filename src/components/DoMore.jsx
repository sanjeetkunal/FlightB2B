import { motion } from "framer-motion";

const items = [
  {
    title: "Flight Tracker",
    badge: "Pro",
    img: "https://cdn-icons-png.flaticon.com/128/3471/3471653.png",
    desc: "Live status, delays, gate updates.",
  },
  {
    title: "Credit Card",
    badge: "Free",
    img: "https://cdn-icons-png.flaticon.com/128/9334/9334539.png",
    desc: "Save cards & pay in one tap.",
  },
  {
    title: "Book Visa",
    img: "https://cdn-icons-png.flaticon.com/128/8632/8632331.png",
    desc: "End-to-end visa assistance.",
  },
  {
    title: "Travel Insurance",
    img: "https://cdn-icons-png.flaticon.com/128/4599/4599465.png",
    desc: "Coverage for delays & cancellations.",
  },
  {
    title: "Group Booking",
    img: "https://cdn-icons-png.flaticon.com/128/143/143438.png",
    desc: "Special fares for big groups.",
  },
  {
    title: "Airport Cabs",
    img: "https://cdn-icons-png.flaticon.com/128/6999/6999229.png",
    desc: "Pre-book airport transfers.",
  },
  {
    title: "Plan",
    img: "https://cdn-icons-png.flaticon.com/128/4748/4748295.png",
    desc: "Smart trip planning tools.",
  },
  {
    title: "Fare Alerts",
    img: "https://cdn-icons-png.flaticon.com/128/12515/12515153.png",
    desc: "Notifications when prices drop.",
  },
];

// Section + grid variants
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
      staggerChildren: 0.08, // cards ek-ek karke animate honge
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export default function DoMore() {
  return (
    <motion.section
      className="mx-auto max-w-7xl pb-10 mt-6"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"           // scroll pe animate
      viewport={{ once: true, amount: 0.3 }} // ek hi baar, jab ~30% section dikhai de
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between gap-3 mb-5"
        variants={cardVariants} // header bhi halka sa fade-up
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Add-ons
          </p>
          <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-slate-900">
            Do more with <span className="text-blue-600">V2A</span>
          </h3>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Power tools for frequent flyers
        </span>
      </motion.div>

      {/* Main Container */}
      <motion.div variants={sectionVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
          {items.map((it) => (
            <motion.button
              key={it.title}
              type="button"
              variants={cardVariants}
              className="
                group flex flex-col items-stretch text-left
                rounded-2xl border border-slate-100
                bg-white/80 backdrop-blur
                px-3.5 py-3.5 sm:px-4 sm:py-4
                shadow-[0_10px_28px_rgba(15,23,42,0.04)]
                transition-all duration-200 ease-out
                hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.16)]
                hover:border-blue-500/60
              "
            >
              {/* Image / Icon */}
              <div className="relative mb-3">
                <div
                  className="
                    inline-flex items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br from-slate-50 via-white to-slate-100
                    ring-1 ring-slate-200/80
                    p-2.5
                    transition-all duration-200
                    group-hover:ring-blue-500/40 group-hover:bg-white
                  "
                >
                  <img
                    src={it.img}
                    alt={it.title}
                    className="
                      h-9 w-9 sm:h-10 sm:w-10 object-contain
                      transition-transform duration-200
                      group-hover:scale-105
                    "
                  />
                </div>

                {/* Badge */}
                {it.badge && (
                  <span
                    className={`absolute -top-1.5 -right-0 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                      it.badge === "Pro"
                        ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {it.badge}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Tool
                </div>

                <div className="text-sm sm:text-[15px] font-semibold text-slate-900">
                  {it.title}
                </div>

                {it.desc && (
                  <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
                    {it.desc}
                  </p>
                )}
              </div>

              {/* Hover CTA */}
              <div
                className="
                  mt-2 flex items-center text-[11px] font-medium text-blue-600
                  opacity-0 translate-y-1
                  group-hover:opacity-100 group-hover:translate-y-0
                  transition-all duration-200
                "
              >
                <span>Open tool</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>

              {/* Bottom Accent Line */}
              <div
                className="
                  mt-3 h-[2px] w-full rounded-full
                  bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                "
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
