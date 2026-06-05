export default function CastingsLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="hairline-b pb-8 mb-10 space-y-3">
        <div className="h-3 w-24 animate-shimmer rounded" />
        <div className="h-10 w-72 animate-shimmer rounded" />
        <div className="h-4 w-96 max-w-full animate-shimmer rounded" />
      </div>
      <ul className="hairline-t">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-6 py-5 hairline-b"
          >
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-32 animate-shimmer rounded" />
              <div className="h-5 w-2/3 animate-shimmer rounded" />
              <div className="h-3 w-1/2 animate-shimmer rounded" />
            </div>
            <div className="h-4 w-4 animate-shimmer rounded shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
