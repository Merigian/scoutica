/** Skeleton mirroring the portfolio manager (3-col edge-bleed gallery on phones). */
export default function PortfolioLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
    >
      <div className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 space-y-3">
        <div className="h-9 w-56 max-w-full animate-shimmer lg:h-11" />
        <div className="h-5 w-72 max-w-full animate-shimmer" />
      </div>

      <div className="-mx-4 grid grid-cols-3 gap-0.5 sm:mx-0 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-shimmer" />
        ))}
      </div>
    </div>
  );
}
