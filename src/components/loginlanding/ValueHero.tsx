// B2BHeroNTW.tsx / .jsx
import {
  Plane, Building2, ShieldCheck, Headphones, WalletCards, Percent
} from "lucide-react";

export default function B2BHeroNTW() {
  const heroImg =
    "https://img.freepik.com/premium-vector/travel-around-world_24640-17115.jpg";

  const points = [
    { icon: Plane,        title: "Direct Supply",      subtitle: "NDC, LCC and GDS in one window" },
    { icon: WalletCards,  title: "GST Invoicing",      subtitle: "Compliant invoices and ledgers" },
    { icon: Percent,      title: "Instant Earnings",   subtitle: "Auto commissions and markups" },
    { icon: Headphones,   title: "24×7 Helpdesk",      subtitle: "Priority partner support" },
    { icon: ShieldCheck,  title: "Secure & Compliant", subtitle: "SSO, IP lock and audit logs" },
    { icon: Building2,    title: "White-Label Portal", subtitle: "Your brand, your domain" },
  ];

  const stats = [
    { k: "2M+",   v: "annual searches" },
    { k: "1200+", v: "active agencies" },
    { k: "99.96%", v: "uptime SLA" },
  ];

  return (
    // FIX-1: clip any accents that extend past the section bounds
    <section className="relative bg-white isolate overflow-hidden">
      {/* background accents (clipped by parent) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-x-0 -top-24 h-72 rotate-[-4deg] bg-[linear-gradient(135deg,#f8fafc,white_30%,#e6f0ff)]" />
        {/* these blobs can keep negative offsets now; they won’t cause horizontal scroll */}
        <div className="absolute right-[-6rem] top-20 h-64 w-64 rounded-full bg-[#E67514]/20 blur-3xl" />
        <div className="absolute left-[-5rem] bottom-0 h-64 w-64 rounded-full bg-[#004aad]/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-12 lg:py-16">
        {/* items-stretch ensures equal height across columns on lg+ */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* LEFT: Image block (equal height) */}
          <div className="lg:col-span-5 h-full">
            <div className="relative h-full">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white h-full">
                {/* mobile/tablet get a sensible min height; lg uses full equal height */}
                <div className="relative h-72 sm:h-96 lg:h-full">
                  {/* FIX-2: make image a block element to avoid inline overflow quirks */}
                  <img
                    src={heroImg}
                    alt="B2B workspace collage"
                    className="absolute inset-0 block h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:col-span-7 flex flex-col">
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
              Grow your travel business with
              <span className="text-blue-600"> Thynk</span>
            </h2>

            <p className="mt-3 text-slate-600 max-w-2xl">
              A powerful portal built for distributors and sub-agents—flights, hotels, train, bus and visa in a single
              dashboard. Enjoy live markups, instant commissions, wallet and credit controls, and enterprise-grade security
              for smooth day-to-day issuance.
            </p>

            {/* stats */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {stats.map((s) => (
                <div key={s.k} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  <span className="text-sm font-semibold text-slate-900">{s.k}</span>
                  <span className="text-xs text-slate-500">{s.v}</span>
                </div>
              ))}
            </div>

            {/* feature points */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {points.map((p, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 p-3 hover:shadow-sm transition"
                >
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
                    <p.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-slate-900">{p.title}</div>
                    <div className="text-sm text-slate-600">{p.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-[#003b87] text-white px-5 py-2.5 text-sm font-medium"
              >
                Create Agency Account
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
