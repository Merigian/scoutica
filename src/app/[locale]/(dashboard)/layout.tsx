import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="lg:ml-[68px] transition-all duration-300">
        <Header />
        <main className="p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
