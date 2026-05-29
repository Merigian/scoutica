export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="h-6 w-24 animate-shimmer rounded-md" />

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-1/3 aspect-[3/4] bg-[var(--bg-soft)] " />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-48 bg-[var(--bg-soft)] rounded" />
          <div className="h-4 w-32 bg-[var(--bg-soft)] rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-20 bg-[var(--bg-soft)] rounded" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-[var(--bg-soft)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--bg-soft)] rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] bg-[var(--bg-soft)] rounded" />
        ))}
      </div>
    </div>
  );
}
