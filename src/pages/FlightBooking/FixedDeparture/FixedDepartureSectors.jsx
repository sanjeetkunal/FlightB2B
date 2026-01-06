import React, { useMemo } from "react";

/**
 * FixedDepartureSectorsOnly.jsx
 * ✅ Theme-match (CSS vars only)
 * ✅ Only sectors (no price / seats / extra tiles)
 * ✅ Click => callback (navigate to listing page)
 * ✅ City image thumbnail on each card (optional via s.img)
 *
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function FixedDepartureSectorsOnly({
  title = "Series Fares Available",
  subtitle = "Select a sector to view fixed-departure inventory",
  sectors: sectorsProp,
  onSelectSector,
  className = "",
}) {
  const sectors = useMemo(() => {
    if (Array.isArray(sectorsProp) && sectorsProp.length) return sectorsProp;

    // ✅ default mock (replace with API)
    // ✅ Add `img` per sector (local preferred: import images and set img: importedFile)
    return [
      {
        id: "DEL-DXB",
        fromCity: "New Delhi",
        fromIata: "DEL",
        toCity: "Dubai",
        toIata: "DXB",
        tag: "Popular",
        img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=640&q=60",
      },
      {
        id: "BOM-SIN",
        fromCity: "Mumbai",
        fromIata: "BOM",
        toCity: "Singapore",
        toIata: "SIN",
        tag: "Fast",
        img: "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?auto=format&fit=crop&w=640&q=60",
      },
      {
        id: "DEL-BKK",
        fromCity: "New Delhi",
        fromIata: "DEL",
        toCity: "Bangkok",
        toIata: "BKK",
        tag: "Value",
        img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=640&q=60",
      },
      {
        id: "BLR-KUL",
        fromCity: "Bengaluru",
        fromIata: "BLR",
        toCity: "Kuala Lumpur",
        toIata: "KUL",
        tag: "Promo",
        img: "https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=640&q=60",
      },
      {
        id: "CCU-DXB",
        fromCity: "Kolkata",
        fromIata: "CCU",
        toCity: "Dubai",
        toIata: "DXB",
        tag: "Trending",
        img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=640&q=60",
      },
      {
        id: "HYD-SHJ",
        fromCity: "Hyderabad",
        fromIata: "HYD",
        toCity: "Sharjah",
        toIata: "SHJ",
        tag: "Allotment",
        img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=640&q=60",
      },
    ];
  }, [sectorsProp]);

  return (
    <section className={cx("relative", className)}>
      <div className="relative mt-10 overflow-hidden rounded-md border border-[color:var(--border)] bg-[var(--surface)]">
        {/* ✅ soft background like screenshot */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.9]"
          style={{
            background:
              "radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--primarySoft) 88%, transparent), transparent 60%)",
          }}
        />

        <div className="relative p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[var(--text)] sm:text-[18px]">
                {title}
              </h3>
              <p className="mt-1 text-[12px] text-[var(--muted)]">{subtitle}</p>
            </div>

            <div className="hidden items-center gap-2 text-[11px] text-[var(--muted)] sm:flex">
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-1 font-semibold">
                Click sector to open listing
              </span>
            </div>
          </div>

          {/* Sectors */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {sectors.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSector?.(s)}
                className={cx(
                  "group w-full text-left rounded-md border",
                  "border-[color:var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] transition",
                  "px-2 py-2"
                )}
                style={{
                  borderColor: "color-mix(in srgb, var(--border) 72%, transparent)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left text */}
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[var(--text)] leading-tight">
                      {s.fromIata} <span className="text-[var(--muted)]">→</span>{" "}
                      {s.toIata}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--muted)] truncate">
                      {s.fromCity} • {s.toCity}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[var(--muted)]">
                        View listing
                      </span>
                      <span className="text-[var(--muted)] transition group-hover:text-[var(--text)]">
                        <ArrowRightMini />
                      </span>
                    </div>
                  </div>

                  {/* Right thumbnail */}
                  <div className="shrink-0 relative h-[56px] w-[64px] overflow-hidden rounded-md border border-[color:var(--border)] bg-[var(--surface)]">
                    {s.img ? (
                      <>
                        <img
                          src={s.img}
                          alt={`${s.toCity}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                        {/* theme overlay (no static colors) */}
                        <div
                          className="absolute inset-0 opacity-[0.35]"
                          style={{
                            background:
                              "linear-gradient(to top, color-mix(in srgb, var(--surface) 88%, transparent), transparent)",
                          }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-[var(--muted)]">
                        {s.toIata}
                      </div>
                    )}

                    {/* Tag chip on image */}
                    {/* {s.tag ? (
                      <span className="absolute top-1 right-1 rounded-full border border-[color:var(--border)] bg-[var(--primarySoft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text)]">
                        {s.tag}
                      </span>
                    ) : null} */}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* empty state */}
          {sectors.length === 0 && (
            <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[var(--surface2)] p-6 text-center">
              <div className="text-sm font-semibold text-[var(--text)]">
                No sectors available
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                Please check back later.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ArrowRightMini() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
