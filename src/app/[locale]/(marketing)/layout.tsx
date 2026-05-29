import { MarketingNav, MarketingFooter } from "@/components/marketing/marketing-nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main id="main" className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
