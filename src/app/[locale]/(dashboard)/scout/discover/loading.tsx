import { Card } from "@/components/ui/card";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-shimmer rounded-md" />
        <div className="h-4 w-64 animate-shimmer rounded-md" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-[var(--bg-soft)] rounded" />
        <div className="h-10 w-32 bg-[var(--bg-soft)] rounded" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 bg-[var(--bg-soft)] rounded" />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[3/4] bg-[var(--bg-soft)]" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-[var(--bg-soft)] rounded" />
              <div className="h-3 w-1/2 bg-[var(--bg-soft)] rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
