import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Once a model is verified there is nothing left to do on the verification
  // page, so we drop its sidebar entry instead of leaving it occupying space.
  let hideVerification = false;
  let completenessScore: number | null = null;
  let verified = false;
  if (session?.user?.role === "MODEL" && session.user.id) {
    const profile = await db.modelProfile.findUnique({
      where: { userId: session.user.id },
      select: { verificationStatus: true, completenessScore: true },
    });
    hideVerification = profile?.verificationStatus === "APPROVED";
    verified = profile?.verificationStatus === "APPROVED";
    completenessScore = profile?.completenessScore ?? null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <DashboardShell
        hideVerification={hideVerification}
        completenessScore={completenessScore}
        verified={verified}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
