// B2BHeroNTW.tsx / .jsx
import { Plane, Building2, ShieldCheck, Headphones, WalletCards, Percent } from "lucide-react";

export default function B2BHeroNTW() {
  const heroImg = "../src/assets/media/travel-fashion.png";

  const points = [
    { icon: Plane, title: "Direct Supply", subtitle: "NDC, LCC and GDS in one window" },
    { icon: WalletCards, title: "GST Invoicing", subtitle: "Compliant invoices and ledgers" },
    { icon: Percent, title: "Instant Earnings", subtitle: "Auto commissions and markups" },
    { icon: Headphones, title: "24×7 Helpdesk", subtitle: "Priority partner support" },
    { icon: ShieldCheck, title: "Secure & Compliant", subtitle: "SSO, IP lock and audit logs" },
    { icon: Building2, title: "White-Label Portal", subtitle: "Your brand, your domain" },
  ];

  const stats = [
    { k: "2M+", v: "annual searches" },
    { k: "1200+", v: "active agencies" },
    { k: "99.96%", v: "uptime SLA" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-[#f6feff] to-white">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* mesh */}
        <div className="absolute inset-0 [background:radial-gradient(1200px_650px_at_20%_25%,rgba(25,184,223,.16),transparent_60%),radial-gradient(900px_520px_at_85%_35%,rgba(57,170,129,.14),transparent_55%),radial-gradient(700px_520px_at_50%_85%,rgba(125,59,150,.09),transparent_55%)]" />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.22] [mask-image:radial-gradient(60%_60%_at_50%_35%,black,transparent)] [background-image:linear-gradient(to_right,rgba(15,23,42,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* LEFT: Image (enterprise frame) */}
          <div className="lg:col-span-5 h-full">
            <div className="relative h-full rounded-md p-[1px] bg-gradient-to-br from-[#19B8DF]/55 via-[#8BD0BD]/35 to-[#39AA81]/55 shadow-[0_22px_60px_rgba(2,6,23,0.14)]">
              <div className="relative h-full rounded-md overflow-hidden bg-white/70 backdrop-blur border border-white/60">
                <div className="relative h-72 sm:h-96 lg:h-full">
                  <img
                    src={heroImg}
                    alt="B2B workspace collage"
                    className="absolute inset-0 block h-full w-full object-cover"
                    loading="eager"
                  />
                  {/* premium overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
                </div>

                {/* corner badge */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 px-3 py-1 text-xs font-medium text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-[#19B8DF]" />
                  Enterprise-ready platform
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:col-span-7 flex flex-col">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-slate-800 shadow-sm">
              <span className="bg-gradient-to-r from-[#19B8DF] via-[#54C5CF] to-[#39AA81] bg-clip-text text-transparent">
                V2A for Distributors & Agencies
              </span>
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
              Grow your travel business with{" "}
              <span className="bg-gradient-to-r from-[#19B8DF] via-[#8BD0BD] to-[#39AA81] bg-clip-text text-transparent">
                V2A
              </span>
            </h2>

            <p className="mt-3 text-slate-600 max-w-2xl">
              A powerful portal built for distributors and sub-agents—flights, hotels, train, bus and visa in a single
              dashboard. Enjoy live markups, instant commissions, wallet and credit controls, and enterprise-grade security
              for smooth day-to-day issuance.
            </p>

            {/* stats (pill style) */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {stats.map((s) => (
                <div
                  key={s.k}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 backdrop-blur px-3 py-1.5 shadow-sm"
                >
                  <span className="text-sm font-semibold text-slate-900">{s.k}</span>
                  <span className="text-xs text-slate-500">{s.v}</span>
                </div>
              ))}
            </div>

            {/* feature points (enterprise cards with gradient border) */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {points.map((p, i) => (
                <div
                  key={i}
                  className="group relative rounded-md p-[1px] bg-gradient-to-br from-[#19B8DF]/45 via-[#8BD0BD]/25 to-[#39AA81]/45 hover:from-[#19B8DF]/65 hover:to-[#39AA81]/65 transition"
                >
                  <div className="flex h-full items-start gap-3 rounded-md bg-white/80 backdrop-blur border border-white/60 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.06)]">
                    <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-white border border-slate-200">
                      <p.icon className="h-6 w-6 text-[#19B8DF] group-hover:text-[#39AA81] transition-colors" />
                    </div>

                    <div>
                      <div className="text-[15px] font-semibold text-slate-900">{p.title}</div>
                      <div className="text-sm text-slate-600">{p.subtitle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#19B8DF] via-[#54C5CF] to-[#39AA81] hover:brightness-[0.95] text-white px-5 py-2.5 text-sm font-medium shadow-sm"
              >
                Create Agency Account
              </a>

              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-4 py-2 text-sm text-slate-800 hover:bg-white shadow-sm"
              >
                Talk to Sales
              </a>

              <span className="text-xs text-slate-500">
                No setup fee • White-label ready • Audit logs & IP lock
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
