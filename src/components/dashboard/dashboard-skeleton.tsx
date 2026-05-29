export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-fade-in">
      {/* Hero skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-xs bg-[var(--bg-soft)]/60 animate-pulse" />
        <div className="h-10 w-72 max-w-full rounded-sm bg-[var(--bg-soft)]/60 animate-pulse" />
        <div className="h-3 w-96 max-w-full rounded-xs bg-[var(--bg-soft)]/40 animate-pulse" />
      </div>
      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-md border border-border bg-[var(--bg-soft)]/60 p-5 space-y-3">
            <div className="h-3 w-24 rounded-xs bg-[var(--bg-soft)]/60 animate-pulse" />
            <div className="h-8 w-16 rounded-sm bg-[var(--bg-soft)]/60 animate-pulse" />
            <div className="h-2 w-12 rounded-xs bg-[var(--bg-soft)]/40 animate-pulse" />
          </div>
        ))}
      </div>
      {/* Two column */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-md border border-border bg-[var(--bg-soft)]/60 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-md border border-border bg-[var(--bg-soft)]/60 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
