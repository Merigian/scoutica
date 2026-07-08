/**
 * Editorial ticker — a slow marquee of outlined Didone city names with gilt
 * lozenge separators. Pure decoration (aria-hidden): the fashion-masthead
 * gesture that stamps the register right under the cover. CSS-only motion
 * (`animate-marquee` translates −50%, so the track renders twice); the global
 * reduced-motion kill-switch freezes it into a static strip.
 */
export function EditorialTicker({ items }: { items: string[] }) {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden hairline-b bg-[var(--bg)] py-6 lg:py-9"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {items.map((city) => (
              <span key={`${copy}-${city}`} className="flex items-center">
                <span className="px-7 font-display font-light uppercase leading-none text-outline-ink text-[clamp(2.75rem,8vw,6rem)] lg:px-10">
                  {city}
                </span>
                <span className="h-2 w-2 rotate-45 bg-[var(--gilt)]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
