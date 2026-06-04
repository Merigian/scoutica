import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReadOnlyBanner } from "@/components/scout/read-only-banner";

export default async function ScoutLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SCOUT") {
    redirect("/login");
  }

  const profile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { verificationStatus: true },
  });

  if (!profile) {
    redirect("/login");
  }

  // New scouts enter immediately in read-only mode (no waitlist, no gate).
  if (profile.verificationStatus === "PENDING") {
    await db.scoutProfile.update({
      where: { userId: session.user.id },
      data: { verificationStatus: "VERIFICATION_REQUIRED" },
    });
  }

  // Unverified scouts can browse the platform read-only. Sensitive actions
  // (contacting models, creating castings/jobs, messaging) are gated server-side.
  const isVerified = profile.verificationStatus === "APPROVED";

  return (
    <>
      {!isVerified && <ReadOnlyBanner />}
      {children}
    </>
  );
}
