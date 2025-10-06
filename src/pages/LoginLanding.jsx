import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";
import Header from "../components/Header";
import Footer from "../components/Footer";



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
      ok = (email === "agent@v2a.com" && otp === "000000") || (email === "distributor@tyb.com" && otp === "000000");
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

    // save auth + redirect
    saveAuth({ user: { email }, token: "demo-token" });
    navigate("/", { replace: true });
    setLoading(false);
  };

  /* ------- Data ------- */
  const products = [
    { k: "Flights", icon: AirplaneIcon, desc: "GDS + LCC + NDC in a single window with multi-city & fare families" },
    { k: "Hotels", icon: HotelIcon, desc: "500K+ properties. Static & dynamic rates. Free-cancel filters" },
    { k: "Train", icon: TrainIcon, desc: "IRCTC B2B, agency mapping, PNR tools & auto-commission" },
    { k: "Bus", icon: BusIcon, desc: "Pan-India inventory with live seat maps & instant refund flows" },
    { k: "Visa", icon: VisaIcon, desc: "Document packs, slot tracking & application workflow" },
    { k: "Utilities", icon: BoltIcon, desc: "Recharge, BBPS, FASTag & more for recurring agency revenue" },
  ];

  const features = [
    { t: "Markups & GST", s: "Flexible markup engine with per-product GST invoicing & HSN/SAC support", icon: PercentIcon },
    { t: "Commission Engine", s: "Multi-level (Retailer / Distributor / Master) with TDS & ledger export", icon: CoinsIcon },
    { t: "Book & Hold", s: "Hold fares, collect partial payment, auto-expiry alerts & reminders", icon: ClockIcon },
    { t: "Roles & Teams", s: "Branch + sub-agents, role-based access, activity logs & audit trails", icon: UsersIcon },
    { t: "Wallet & Credit", s: "Wallet top-ups, credit lines, limits, approvals & statements", icon: WalletIcon },
    { t: "Recon & Reports", s: "Daily recon, supplier-wise settlements, XLS/CSV exports, APIs", icon: ReportIcon },
  ];

  const stats = [
    { k: "+2M", v: "Annual Searches" },
    { k: "1200+", v: "Active Agencies" },
    { k: "15+", v: "Supply Partners" },
    { k: "99.96%", v: "Uptime (SLA)" },
  ];

  const partners = useMemo(
    () => ["Amadeus", "Sabre", "Galileo", "IndiGo", "Air India", "Vistara", "SpiceJet", "Emirates", "Qatar Airways", "MakeMyTrip B2B", "Booking.com", "IRCTC"],
    []
  );

  return (
    <>
      {/* Header: pass `public` to hide after-login controls */}
      <Header variant="public" />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-blue-200 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:px-6 lg:px-8 pt-10 pb-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <SparklesIcon className="w-4 h-4" /> Premium B2B Travel OS
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight text-slate-900">
                All your <span className="text-blue-900">travel products</span> in one powerful dashboard
              </h1>
              <p className="mt-3 text-slate-600 max-w-2xl">
                Book Flights, Hotels, Train, Bus & Visa with live markups, commission engine, GST invoicing,
                wallet, credit control and deep reporting — crafted for distributors & sub‑agents.
              </p>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.k} className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-4 py-3 text-center">
                    <div className="text-xl font-semibold text-slate-900">{s.k}</div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Trust strip */}
              <div className="mt-8">
                <p className="text-xs text-slate-500">Trusted by leading suppliers & aggregators</p>
                <PartnerMarquee items={partners} />
              </div>
            </div>

            {/* Login card */}
            <div className="relative lg:col-span-5">
              <div className="relative bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">Agent Login</h2>
                  <span className="text-xs text-slate-500">Demo access available</span>
                </div>

                {/* Tabs */}
                <div className="mt-4 grid grid-cols-2 rounded-full border border-gray-50 p-1 bg-slate-50">
                  <button
                    onClick={() => setTab("password")}
                    className={`text-sm rounded-full py-2 transition ${
                      tab === "password" ? "bg-white shadow font-medium" : "text-slate-500 hover:text-slate-700"
                    }`}
                    aria-current={tab === "password"}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => setTab("otp")}
                    className={`text-sm rounded-full py-2 transition ${
                      tab === "otp" ? "bg-white shadow font-medium" : "text-slate-500 hover:text-slate-700"
                    }`}
                    aria-current={tab === "otp"}
                  >
                    OTP
                  </button>
                </div>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Business Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="agent@v2a.com"
                      className="mt-1 w-full rounded-xl border-slate-300 focus:none border border-gray-50 px-3 py-2.5 outline-none"
                      required
                    />
                  </div>

                  {tab === "password" ? (
                    <div>
                      <label className="block text-sm font-medium">Password</label>
                      <div className="relative mt-1">
                        <input
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password123"
                          className="w-full rounded-xl border-slate-300 border border-gray-50 focus:none px-3 py-2.5 pr-10 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                          <span>Remember me</span>
                        </label>
                        <button type="button" className="text-amber-700 hover:underline">Forgot password?</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium">One-Time Password</label>
                      <div className="mt-1 grid grid-cols-6 gap-2" role="group" aria-label="OTP inputs">
                        <OtpInput value={otp} onChange={setOtp} />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Demo OTP: <span className="font-medium">000000</span></div>
                    </div>
                  )}

                  {err && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-2.5">{err}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-900 hover:bg-amber-600 text-white px-5 py-2.5 font-medium disabled:opacity-60"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>

                

                  <p className="text-xs text-slate-500 text-center">
                    Demo credentials: <span className="font-medium">agent@v2a.com / Password123</span>
                  </p>
                </form>
              </div>

     
            </div>
          </div>
        </div>
      </section>

      {/* Product Suite */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Product Suite</h3>
              <p className="text-slate-600 text-sm">Everything a growing travel business needs — unified.</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 hover:bg-slate-50">
              Explore APIs <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div key={p.k} className="group relative rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border bg-white p-2"><p.icon className="w-5 h-5" /></div>
                  <h4 className="text-lg font-semibold text-slate-900">{p.k}</h4>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-amber-700 text-sm">
                  Learn more <ArrowRightIcon className="w-4 h-4" />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-amber-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-slate-900">Built for B2B at Scale</h3>
            <p className="text-slate-600 text-sm">Control pricing, teams, credit and reconciliation with confidence.</p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border bg-amber-50 text-amber-700 p-2"><f.icon className="w-5 h-5" /></div>
                  <h4 className="text-base font-semibold text-slate-900">{f.t}</h4>
                </div>
                <p className="mt-2 text-sm text-slate-600">{f.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:px-6 lg:px-8 py-12">
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

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
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

      {/* CTA Footer */}
      <footer className="bg-slate-900 text-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="text-xl font-semibold">Ready to supercharge your B2B?</h4>
            <p className="text-slate-400 text-sm mt-1">Onboard in minutes. Add sub‑agents. Start issuing GST invoices today.</p>
          </div>
          <div className="flex md:justify-end">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-blue-900 hover:bg-amber-600 text-white px-5 py-2.5 font-medium">
              Create Agency Account <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

        <Footer />
    </>
  );
}

/* ==================== Small Components ==================== */
function PartnerMarquee({ items }) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex gap-10 animate-[marquee_28s_linear_infinite] py-3 px-4 will-change-transform">
        {[...items, ...items].map((n, i) => (
          <span key={i} className="text-slate-500 text-xs sm:text-sm whitespace-nowrap inline-flex items-center gap-2">
            <Dot className="w-1.5 h-1.5" /> {n}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
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
          className="w-11 h-12 text-center text-lg font-semibold rounded-xl border-slate-300 border focus:none outline-none"
        />
      ))}
    </>
  );
}

function SSOButton({ label }) {
  return (
    <button type="button" className="inline-flex items-center gap-2 text-xs rounded-full border px-3 py-1.5 hover:bg-slate-50">
      <Dot className="w-2.5 h-2.5" /> {label}
    </button>
  );
}

/* ====================== Icons (inline) ====================== */
function Dot(props){return(<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true" {...props}><circle cx="5" cy="5" r="5"/></svg>)}
function ArrowRightIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>)}
function SparklesIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zm7 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM4 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/></svg>)}
function AirplaneIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M10 21l2-5 7-2-9-9-2 7-5 2 7 7z"/></svg>)}
function HotelIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M7 7V5a3 3 0 016 0v2"/></svg>)}
function TrainIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="6" y="3" width="12" height="12" rx="2"/><path d="M6 11h12M8 21l2-2m6 2l-2-2"/></svg>)}
function BusIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="4" y="5" width="16" height="12" rx="2"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>)}
function VisaIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M4 4h16v16H4z"/><path d="M8 12h8M12 8v8"/></svg>)}
function BoltIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>)}
function PercentIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M19 5L5 19"/><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/></svg>)}
function CoinsIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>)}
function ClockIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>)}
function UsersIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><circle cx="9" cy="8" r="4"/><path d="M17 11a4 4 0 110 8M3 21a6 6 0 1112 0"/></svg>)}
function WalletIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M16 12h5"/></svg>)}
function ReportIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>)}
function ShieldIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"/></svg>)}
