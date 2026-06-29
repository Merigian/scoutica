import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Once a model is verified there is nothing left to do on the verification
  // page, so we drop its sidebar entry instead of leaving it occupying space.
  let hideVerification = false;
  if (session?.user?.role === "MODEL" && session.user.id) {
    const profile = await db.modelProfile.findUnique({
      where: { userId: session.user.id },
      select: { verificationStatus: true },
    });
    hideVerification = profile?.verificationStatus === "APPROVED";
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar hideVerification={hideVerification} />
      <div className="lg:ml-[68px] transition-all duration-300">
        <Header hideVerification={hideVerification} />
        <main className="p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
