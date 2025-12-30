import { useMemo } from "react";

/**
 * B2BFooter.jsx
 * A professional, TBO‑style enterprise footer for travel agencies and consolidators.
 * — React + TailwindCSS
 * — Dark‑mode ready, fully responsive, keyboard accessible
 * — Includes: newsletter, quick links, products, support, legal, company, language/currency pickers,
 *   trust badges, partner logos, social icons, app store buttons, and compact bottom bar
 */

export default function B2BFooter() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const partnerLogos = useMemo(
    () => [
      { name: "Amadeus", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Amadeus_%28CRS%29_Logo.svg/1200px-Amadeus_%28CRS%29_Logo.svg.png", w: 96, h: 24 },
      { name: "Sabre", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sabre_Corporation_logo.svg/2560px-Sabre_Corporation_logo.svg.png", w: 84, h: 24 },
      { name: "Travelport", src: "https://i0.wp.com/www.opendestinations.com/wp-content/uploads/2018/03/logo-travelport.png?fit=799%2C250&ssl=1", w: 110, h: 24 },
      { name: "IndiGo", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/2560px-IndiGo_Airlines_logo.svg.png", w: 80, h: 24 },
      { name: "Vistara", src: "https://airhex.com/images/airline-logos/alt/vistara.png", w: 96, h: 24 },
      { name: "Turkish", src: "https://airhex.com/images/airline-logos/alt/spicejet.png", w: 96, h: 24 },

    ],
    []
  );

  return (
    <footer className="relative border-t relative border-t bg-gray-950  ">
      {/* Top CTA band */}


      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-12 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 px-4">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-black">V2A</span>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Virtual2Actual</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Turning Vision Into Reality</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
              One contract. Worldwide supply. Build and scale your agency with flights, hotels, visas, insurance and more.
            </p>



            {/* App badges */}
            <div className="mt-6 flex items-center gap-3">
              <StoreBadge kind="apple" />
              <StoreBadge kind="google" />
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <Badge>PCI‑DSS</Badge>
              <Badge>ISO 27001</Badge>
              <Badge>IATA TIDS</Badge>
              <Badge>GST Ready</Badge>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            <LinkBlock title="Products" links={[
              { label: "Flights (GDS/NDC)", href: "#" },
              { label: "Hotels & Apartments", href: "#" },
              { label: "Visas & Insurance", href: "#" },
              { label: "LCC + Full Service", href: "#" },
              { label: "Credit & Wallet", href: "#" },
            ]} />
            <LinkBlock title="Solutions" links={[
              { label: "Small Agencies", href: "#" },
              { label: "Enterprises / TMCs", href: "#" },
              { label: "Corporate Booking", href: "#" },
              { label: "API / White‑label", href: "#" },
              { label: "Group Desk", href: "#" },
            ]} />
            <LinkBlock title="Company" links={[
              { label: "About Us", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Press", href: "#" },
              { label: "Contact", href: "#" },
              { label: "Partners", href: "#" },
            ]} />
            <LinkBlock title="Support" links={[
              { label: "Help Center", href: "#" },
              { label: "Ticketing SLA", href: "#" },
              { label: "Knowledge Base", href: "#" },
              { label: "Developer Docs", href: "#" },
              { label: "Report an Issue", href: "#" },
            ]} />
          </div>
        </div>

        {/* Middle bar: partners, selectors, socials */}
        <div className="mt-12 border-t border-gray-200 dark:border-neutral-800 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Partner strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span className="text-gray-500 dark:text-gray-500">Preferred partners:</span>
              {partnerLogos.map((l) => (
                <img
                  key={l.name}
                  src={l.src}
                  width={l.w}
                  height={l.h}
                  alt={l.name}
                  loading="lazy"
                  className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition dark:brightness-0 dark:invert"
                />
              ))}
            </div>

            {/* Selectors + Socials */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              <div className="flex items-center gap-3 ml-0 sm:ml-2">
                <Social icon="x" />
                <Social icon="linkedin" />
                <Social icon="youtube" />
                <Social icon="facebook" />
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 border-t border-gray-200 dark:border-neutral-800 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {year} Virtual2Actual Pvt. Ltd. All rights reserved. CIN U12345XX2020PTC000000
            </p>
            <ul className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Terms</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Privacy</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Cookie Policy</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Responsible Disclosure</a></li>
              <li><a className="hover:text-gray-900 dark:hover:text-white" href="#">Compliance</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =============== Sub‑components =============== */
function LinkBlock({ title, links }) {
  return (
    <nav aria-label={title}>
      <h4 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="group inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="relative">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </span>
              <span aria-hidden className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition">→</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function StoreBadge({ kind }) {
  if (kind === "apple") {
    return (
      <a href="#" className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 hover:shadow-sm transition">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90"><path d="M16.365 1.43a5.6 5.6 0 0 1-1.36 4.305 5.1 5.1 0 0 1-3.84 1.746 5.682 5.682 0 0 1 1.386-4.39A5.32 5.32 0 0 1 16.364 1.43ZM21.64 17.86c-.36.826-.78 1.59-1.26 2.29-.67.97-1.22 1.64-1.66 2.01-.66.61-1.36.93-2.12.95-.54 0-1.2-.16-2-.48-.8-.32-1.53-.48-2.18-.48-.68 0-1.43.16-2.25.48-.82.32-1.48.49-1.98.5-.74.03-1.46-.29-2.16-.96-.47-.4-1.03-1.08-1.68-2.04-.72-1.04-1.31-2.25-1.77-3.62-.5-1.53-.75-3-.75-4.35 0-1.6.35-2.98 1.04-4.14a6.52 6.52 0 0 1 2.39-2.45c.95-.55 1.97-.84 3.05-.86.6 0 1.39.18 2.37.55.98.37 1.61.56 1.9.56.2 0 .87-.21 2.03-.62 1.09-.38 2.01-.54 2.78-.51 2.05.17 3.6.97 4.66 2.4-1.85 1.12-2.77 2.7-2.77 4.72 0 1.57.58 2.88 1.73 3.94.52.5 1.1.88 1.73 1.15-.14.4-.3.8-.47 1.2Z" /></svg>
        <div className="leading-none">
          <div className="text-[10px] text-gray-500 dark:text-gray-400">Download on the</div>
          <div className="text-xs font-semibold">App Store</div>
        </div>
      </a>
    );
  }
  return (
    <a href="#" className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 hover:shadow-sm transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90"><path d="M3.6 2.2 14 12 3.6 21.8c-.4-.3-.6-.8-.6-1.3v-17c0-.5.2-1 .6-1.3Zm10.2 9.8 2.5 2.5-8.7 5c-.4.2-.9.2-1.2 0l7.4-7.5Zm3.5-3.6 2.1 1.2c.4.2.6.6.6 1s-.2.8-.6 1l-2.1 1.2-2.9-2.9 2.9-2.9Z" /></svg>
      <div className="leading-none">
        <div className="text-[10px] text-gray-500 dark:text-gray-400">Get it on</div>
        <div className="text-xs font-semibold">Google Play</div>
      </div>
    </a>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 py-1">{children}</span>
  );
}

function Logo({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-neutral-800 px-2.5 py-1.5 bg-white dark:bg-neutral-900">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}

function Selector({ label, options }) {
  return (
    <label className="relative inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 py-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <select className="appearance-none bg-transparent outline-none text-gray-900 dark:text-white">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="pointer-events-none"><path d="M5 7l5 6 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </label>
  );
}

function Social({ icon }) {
  const path = {
    x: "M18 2.01c-1.1.66-2.3 1.15-3.55 1.4A6.17 6.17 0 0 0 9.8 3.2C7.2 4.4 5.7 7.1 6.2 9.8 3.1 9.6 0.4 8.1 0 5.9c0 0-.8 4.8 3.7 6.8-1.4.9-3.2 1-4.7.4 0 0 1.5 4.2 6.4 4.6C2.9 19.8.6 21 0 21c4.9 3.1 11.5 1.4 14.7-3.7 2.1-3.2 2.2-7.1 1.7-10.1A9.3 9.3 0 0 0 18 2Z",
    linkedin: "M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM0 7h5v13H0V7Zm7 0h5v2h.1c.7-1.3 2.5-2.6 5.1-2.6 5.4 0 6.4 3.5 6.4 8.1V20H18v-5.8c0-1.4 0-3.2-2-3.2s-2.4 1.6-2.4 3.1V20H7V7Z",
    youtube: "M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C18.9 3.3 12 3.3 12 3.3s-6.9 0-9.1.5C1.7 4.1.8 5 0 6.2-.5 8.4-.5 12-.5 12s0 3.6.5 5.8c.3 1.2 1.2 2.1 2.4 2.4 2.3.5 9.1.5 9.1.5s6.9 0 9.1-.5c1.2-.3 2.1-1.2 2.4-2.4.5-2.2.5-5.8.5-5.8s0-3.6-.5-5.8ZM9.6 15.5V8.5L15.8 12l-6.2 3.5Z",
    facebook: "M13.5 22V12h3l.5-4h-3.5V6.1c0-1 .3-1.7 1.8-1.7H17V1.2C16.6 1.1 15.7 1 14.6 1 12 1 10.2 2.6 10.2 5.5V8H7v4h3.2v10h3.3Z",
  }[icon];
  return (
    <a href="#" aria-label={icon} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-sm transition">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d={path} /></svg>
    </a>
  );
}
