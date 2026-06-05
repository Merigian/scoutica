export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="hairline-b pb-8 mb-8 space-y-3">
        <div className="h-3 w-24 animate-shimmer rounded" />
        <div className="h-10 w-56 animate-shimmer rounded" />
      </div>
      <ul className="hairline-t">
        {Array.from({ length: 7 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 py-4 hairline-b">
            <div className="h-11 w-11 rounded-full animate-shimmer shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 animate-shimmer rounded" />
              <div className="h-3 w-2/3 animate-shimmer rounded" />
            </div>
            <div className="h-3 w-12 animate-shimmer rounded shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
