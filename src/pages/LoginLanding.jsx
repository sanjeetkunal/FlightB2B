import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// OPTIONAL: your own sections (keep if you already have them)
import ValueHero from "../components/loginlanding/ValueHero";
import CompanyAdvantages from "../components/loginlanding/CompanyAdvantages";

export default function LoginLandingPro() {
  const [tab, setTab] = useState("password"); // 'password' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    const isEmailOk = email.includes("@") && email.includes(".");
    if (!isEmailOk) {
      setErr("Enter a valid business email.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    let ok = false;
    if (tab === "password") {
      ok =
        (email === "agent@v2a.com" && password === "Password123") ||
        (email === "distributor@tyb.com" && password === "Password123");
    } else {
      ok =
        (email === "agent@v2a.com" && otp === "000000") ||
        (email === "distributor@tyb.com" && otp === "000000");
    }

    if (!ok) {
      setErr(
        tab === "password"
          ? "Invalid credentials. Try agent@v2a.com / Password123"
          : "Invalid OTP. Use 000000 for demo"
      );
      setLoading(false);
      return;
    }

    saveAuth({ user: { email }, token: "demo-token" });
    navigate("/", { replace: true });
    setLoading(false);
  };

  const stats = [
    { k: "+2M", v: "Annual Searches" },
    { k: "1200+", v: "Active Agencies" },
    { k: "15+", v: "Supply Partners" },
    { k: "99.96%", v: "Uptime (SLA)" },
  ];

  const partnerLogos = useMemo(
    () => [
      { name: "Amadeus", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Amadeus_%28CRS%29_Logo.svg/1200px-Amadeus_%28CRS%29_Logo.svg.png", w: 96, h: 24 },
      { name: "Sabre", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sabre_Corporation_logo.svg/2560px-Sabre_Corporation_logo.svg.png", w: 84, h: 24 },
      { name: "Galileo", src: "https://i0.wp.com/www.opendestinations.com/wp-content/uploads/2018/03/logo-travelport.png?fit=799%2C250&ssl=1", w: 96, h: 24 },
      { name: "IndiGo", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/2560px-IndiGo_Airlines_logo.svg.png", w: 80, h: 24 },
      { name: "Air India", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Air_India_2023.svg/1200px-Air_India_2023.svg.png", w: 96, h: 24 },
      { name: "Vistara", src: "https://airhex.com/images/airline-logos/alt/vistara.png", w: 96, h: 24 },
      { name: "SpiceJet", src: "https://airhex.com/images/airline-logos/alt/spicejet.png", w: 96, h: 24 },
      { name: "Emirates", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtm7QhtMWlUdJws_oU4ukSp3ECOutKmgz_Z68u4MMlIM5uqJ-l_aipzC_ZfpXLR_H57Q&usqp=CAU", w: 96, h: 24 },
      { name: "Qatar Airways", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Qatar_Airways_logo.svg/1200px-Qatar_Airways_logo.svg.png", w: 110, h: 24 },
      { name: "MakeMyTrip", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Makemytrip_logo.svg/1558px-Makemytrip_logo.svg.png", w: 110, h: 24 },
      { name: "Booking.com", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png", w: 110, h: 24 },
      { name: "IRCTC", src: "https://logos-world.net/wp-content/uploads/2022/06/IRCTC-Symbol.png", w: 84, h: 24 },
    ],
    []
  );

  return (
    <>
    

      {/* ============== HERO (responsive) ============== */}
 <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-[#f6feff] to-white">
  {/* background accents */}
  <div
    className="pointer-events-none absolute inset-0 -z-10 opacity-80"
    aria-hidden="true"
  >
    {/* soft mesh */}
    <div className="absolute inset-0 [background:radial-gradient(1200px_600px_at_20%_20%,rgba(25,184,223,.18),transparent_60%),radial-gradient(900px_500px_at_85%_35%,rgba(57,170,129,.16),transparent_55%),radial-gradient(700px_500px_at_50%_85%,rgba(125,59,150,.10),transparent_55%)]" />
    {/* subtle grid */}
    <div className="absolute inset-0 opacity-[0.22] [mask-image:radial-gradient(60%_60%_at_50%_35%,black,transparent)] [background-image:linear-gradient(to_right,rgba(15,23,42,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
  </div>

  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 pt-10 pb-16">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
      {/* Left copy */}
      <div className="lg:col-span-8">
        <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-900 bg-white/70 backdrop-blur border border-slate-200 rounded-full px-3 py-1 shadow-sm">
          <SparklesIcon className="w-4 h-4 text-[#19B8DF]" />
          <span className="bg-gradient-to-r from-[#19B8DF] via-[#54C5CF] to-[#39AA81] bg-clip-text text-transparent">
            Premium B2B Travel OS
          </span>
        </p>

        <h1 className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight text-slate-900">
          All your{" "}
          <span className="bg-gradient-to-r from-[#19B8DF] via-[#8BD0BD] to-[#39AA81] bg-clip-text text-transparent">
            travel products
          </span>{" "}
          in one powerful dashboard
        </h1>

        <p className="mt-3 text-slate-600 max-w-2xl">
          Book Flights, Hotels, Train, Bus & Visa with live markups, commission engine, GST invoicing,
          wallet, credit control and deep reporting — crafted for distributors & sub-agents.
        </p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.k}
              className="rounded-md border border-slate-200 bg-white/75 backdrop-blur px-4 py-3 text-center shadow-[0_10px_30px_rgba(2,6,23,0.06)]"
            >
              <div className="text-xl font-semibold text-slate-900">{s.k}</div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-8">
          <p className="text-xs text-slate-500">Trusted by leading suppliers & aggregators</p>
          <PartnerMarquee items={partnerLogos} />
        </div>
      </div>

      {/* Right login card */}
      <div className="lg:col-span-4">
        {/* gradient border wrapper */}
        <div className="relative rounded-md p-[1px] bg-gradient-to-br from-[#19B8DF]/55 via-[#8BD0BD]/35 to-[#39AA81]/55 shadow-[0_20px_60px_rgba(2,6,23,0.16)]">
          <div className="relative rounded-md border border-white/60 bg-white/80 backdrop-blur-xl p-6 sm:p-8 overflow-hidden">
            {/* subtle inner glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#19B8DF]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[#39AA81]/18 blur-3xl" />

            <div className="relative flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Agent Login</h2>
              <span className="text-xs text-slate-500">Demo access available</span>
            </div>

            {/* Tabs */}
            <div className="relative mt-4 grid grid-cols-2 rounded-full border border-slate-200 p-1 bg-white/70">
              <button
                type="button"
                onClick={() => setTab("password")}
                className={`text-sm rounded-full py-2 transition ${
                  tab === "password"
                    ? "bg-gradient-to-r from-[#19B8DF] via-[#54C5CF] to-[#39AA81] text-white shadow font-medium"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={tab === "password"}
              >
                Password
              </button>

              <button
                type="button"
                onClick={() => setTab("otp")}
                className={`text-sm rounded-full py-2 transition ${
                  tab === "otp"
                    ? "bg-gradient-to-r from-[#19B8DF] via-[#54C5CF] to-[#39AA81] text-white shadow font-medium"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={tab === "otp"}
              >
                OTP
              </button>
            </div>

            <form onSubmit={onSubmit} className="relative mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800">Business Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@v2a.com"
                    className="w-full rounded-md border border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-[#19B8DF]/40"
                    required
                  />
                </div>
              </div>

              {tab === "password" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-800">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password123"
                      className="w-full rounded-md border border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 pl-9 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-[#19B8DF]/40"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute inset-y-0 right-0 grid place-items-center px-3 text-slate-500 hover:text-slate-900 focus:outline-none"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      aria-pressed={showPw}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 bg-white" />
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-800">One-Time Password</label>
                  <div className="mt-1 grid grid-cols-6 gap-2" role="group" aria-label="OTP inputs">
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Demo OTP: <span className="font-medium text-slate-900">000000</span>
                  </div>
                </div>
              )}

              {err && (
                <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-md p-2.5">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#19B8DF] via-[#54C5CF] to-[#39AA81] hover:brightness-[0.95] text-white px-5 py-2.5 font-medium disabled:opacity-60 shadow-sm"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Demo credentials:{" "}
                <span className="font-medium text-slate-900">agent@v2a.com / Password123</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>



      {/* ============== PRODUCT SUITE (cards with full-cover images + bottom gradient) ============== */}
      {/* <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Product Suite</h3>
              <p className="text-slate-600 text-sm">Everything a growing travel business needs — unified.</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 hover:bg-slate-50">
              Explore APIs <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <ProductGrid />
        </div>
      </section> */}

      {/* OPTIONAL sections if you have them */}
      {typeof ValueHero === "function" && <ValueHero />}
      {typeof CompanyAdvantages === "function" && <CompanyAdvantages />}

      {/* ============== FAQ ============== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-12">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Frequently Asked Questions</h3>
              <p className="text-slate-600 text-sm">Quick answers for agencies, distributors and enterprises.</p>
              <div className="mt-6 space-y-3">
                <FaqItem q="Do you support multi-level commissions?" a="Yes. Configure retail, distributor, and master overrides with TDS, GST and ledger exports." />
                <FaqItem q="Can I enable Book & Hold and partial payment?" a="Yes. Setup holds with auto-expiry reminders and collect partials via wallet/PG." />
                <FaqItem q="Do you offer APIs?" a="Yes. Product, wallet and report APIs with IP whitelisting and OAuth options." />
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
              <h4 className="text-lg font-semibold text-slate-900">Need an enterprise rollout?</h4>
              <p className="text-sm text-slate-600 mt-1">We provide white-labeling, SSO, custom roles, and data residency options.</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <li className="inline-flex items-center gap-2"><ShieldIcon className="w-4 h-4" /> SSO (SAML / OIDC)</li>
                <li className="inline-flex items-center gap-2"><ShieldIcon className="w-4 h-4" /> IP Whitelisting</li>
                <li className="inline-flex items-center gap-2"><ShieldIcon className="w-4 h-4" /> Audit Logs</li>
                <li className="inline-flex items-center gap-2"><ShieldIcon className="w-4 h-4" /> Data Residency</li>
              </ul>
              <div className="mt-6 inline-flex items-center gap-2 text-sm rounded-full border border-slate-200 px-3 py-1.5">
                Talk to Sales <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA FOOTER ============== */}
      <footer className="bg-slate-900 text-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="text-xl font-semibold">Ready to supercharge your B2B?</h4>
            <p className="text-slate-400 text-sm mt-1">Onboard in minutes. Add sub-agents. Start issuing GST invoices today.</p>
          </div>
          <div className="flex md:justify-end">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-medium">
              Create Agency Account <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>


    </>
  );
}

/* ====================== Partner logos marquee ====================== */
function PartnerMarquee({ items = [] }) {
  const logos = items;

  return (
    <div className="mt-3 overflow-hidden rounded-md bg-white relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />

      <div
        className="flex items-center gap-10 py-3 px-4 will-change-transform"
        style={{ animation: "marquee 28s linear infinite", width: "max-content" }}
        aria-label="Trusted brand logos"
      >
        {[...logos, ...logos].map((l, i) => (
          <div key={i} className="shrink-0 inline-flex items-center">
            <img
              src={l.src}
              width={l.w}
              height={l.h}
              alt={l.name}
              loading="lazy"
              className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition"
              onError={(e) => { e.currentTarget.replaceWith(document.createTextNode(l.name)); }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .will-change-transform { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ====================== Product grid (full-cover images + bottom-gradient content) ====================== */
function ProductGrid() {
  const art = {
    flights: "https://assets.gqindia.com/photos/6540e2ba4622f7146b12b76b/16:9/w_2560%2Cc_limit/best-time-to-book-flights.jpg",
    hotels:  "https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg",
    train:   "https://metrorailnews.in/wp-content/uploads/2025/02/indian-railways-1.jpg",
    bus:     "https://assets-news.housing.com/news/wp-content/uploads/2022/10/04130905/774-BUS-ROUTE-FEATURE-compressed.jpg",
    visa:    "https://dslegals.com/wp-content/uploads/2023/10/download.jpg",
    util:    "https://ivinsutah.gov/wp-content/uploads/2022/09/Utility-Services.png",
  };

  const items = [
    { key: "Flights",   icon: AirplaneIcon, img: art.flights, desc: "GDS + LCC + NDC with fare families, ancillaries & multi-city wizard", pill: "Live NDC" },
    { key: "Hotels",    icon: HotelIcon,    img: art.hotels,  desc: "Static + dynamic rates from 500K+ properties with free-cancel filters", pill: "500K+" },
    { key: "Train",     icon: TrainIcon,    img: art.train,   desc: "IRCTC B2B with PNR tools, agency mapping & auto-commission",       pill: "IRCTC" },
    { key: "Bus",       icon: BusIcon,      img: art.bus,     desc: "Pan-India inventory, live seat maps & instant refund flows",       pill: "Live Seats" },
    { key: "Visa",      icon: VisaIcon,     img: art.visa,    desc: "Document kits, slot tracking & application workflow automations",  pill: "Workflows" },
    { key: "Utilities", icon: BoltIcon,     img: art.util,    desc: "Recharge, BBPS, FASTag & more—unlock recurring agency revenue",    pill: "BBPS" },
  ];

  return (
    <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p, i) => (
        <ProductCard key={p.key} data={p} featured={i === 0} />
      ))}
    </div>
  );
}

function ProductCard({ data, featured = false }) {
  const { key, icon: Icon, img, desc, pill } = data;

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-md border border-slate-200 shadow-sm",
        featured ? "lg:col-span-2 lg:aspect-[21/9]" : "aspect-[16/10]"
      ].join(" ")}
    >
      <img
        src={img}
        alt={`${key} banner`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      {pill && (
        <div className="absolute top-3 right-3 text-xs rounded-full px-2.5 py-1 bg-white/90 text-slate-900 shadow-sm">
          {pill}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-md border border-white/60 bg-white/90 text-slate-900 shadow-sm p-2">
            <Icon className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-semibold text-white">{key}</h4>
        </div>
        <p className="mt-2 text-sm text-slate-200">{desc}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-amber-300 text-sm">
          Learn more <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ====================== Small components ====================== */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 px-4 py-3">
        <span className="text-sm font-medium text-slate-900 text-left">{q}</span>
        <span className="text-slate-500">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-600">{a}</div>}
    </div>
  );
}

function OtpInput({ value, onChange }) {
  const set = (idx, d) => {
    const next = (value || "").padEnd(6, "").split("");
    next[idx] = d.replace(/\D/g, "").slice(-1);
    onChange(next.join(""));
  };
  const cells = new Array(6).fill(0);
  return (
    <>
      {cells.map((_, i) => (
        <input
          key={i}
          inputMode="numeric"
          maxLength={1}
          value={(value || "")[i] || ""}
          onChange={(e) => set(i, e.target.value)}
          className="w-11 h-12 text-center text-lg font-semibold rounded-md border-slate-300 border bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/40 outline-none"
        />
      ))}
    </>
  );
}

/* ====================== Inline icons used by ProductGrid ====================== */
function Dot(props) { return (<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" {...props}><circle cx="5" cy="5" r="5" /></svg>); }
function ArrowRightIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>); }
function SparklesIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zm7 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM4 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" /></svg>); }
function AirplaneIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M10 21l2-5 7-2-9-9-2 7-5 2 7 7z" /></svg>); }
function HotelIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M7 7V5a3 3 0 016 0v2" /></svg>); }
function TrainIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="6" y="3" width="12" height="12" rx="2" /><path d="M6 11h12M8 21l2-2m6 2l-2-2" /></svg>); }
function BusIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="4" y="5" width="16" height="12" rx="2" /><circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></svg>); }
function VisaIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M4 4h16v16H4z" /><path d="M8 12h8M12 8v8" /></svg>); }
function BoltIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" /></svg>); }
function ShieldIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z" /></svg>); }
