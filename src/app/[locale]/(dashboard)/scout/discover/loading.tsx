/** Skeleton mirroring the scout discover layout (2-col edge-bleed gallery). */
export default function DiscoverLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      {/* Page header */}
      <div className="hairline-b pb-8 lg:pb-10 space-y-3">
        <div className="h-9 w-64 max-w-full animate-shimmer lg:h-11" />
        <div className="h-5 w-80 max-w-full animate-shimmer" />
      </div>

      {/* Filters (desktop inline panel only — mobile trigger lives in the header) */}
      <div className="hidden animate-shimmer lg:block lg:h-32" />

      {/* Sort / density bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-24 animate-shimmer" />
        <div className="h-8 w-32 animate-shimmer" />
      </div>

      {/* Card grid — edge-to-edge on mobile like the real grid */}
      <div className="-mx-4 lg:mx-0">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] animate-shimmer" />
              <div className="space-y-1.5 px-1 pt-3 pb-2">
                <div className="h-4 w-3/4 animate-shimmer" />
                <div className="h-3 w-1/2 animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
