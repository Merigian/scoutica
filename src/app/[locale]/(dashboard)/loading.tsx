/**
 * Generic dashboard skeleton — shaped like PageContainer + PageHeader with a
 * few content rows, shimmering per the design system (no spinners). Route
 * segments override this with skeletons shaped like their own layout.
 */
export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
    >
      <div className="hairline-b pb-8 lg:pb-10 mb-10 lg:mb-14 space-y-3">
        <div className="h-4 w-28 animate-shimmer" />
        <div className="h-9 w-72 max-w-full animate-shimmer lg:h-11" />
      </div>
      <div className="space-y-4">
        <div className="h-24 animate-shimmer" />
        <div className="h-24 animate-shimmer" />
        <div className="h-24 animate-shimmer" />
      </div>
    </div>
  );
}
