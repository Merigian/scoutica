import { MarketingNav, MarketingFooter } from "@/components/marketing/marketing-nav";
import { BrandPreloader } from "@/components/motion/brand-preloader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <BrandPreloader />
      <MarketingNav />
      <main id="main" className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
