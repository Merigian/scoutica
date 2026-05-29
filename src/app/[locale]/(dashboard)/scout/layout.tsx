import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isScoutGateOpen } from "@/server/queries/settings";

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

  // Handle PENDING status: check scout gate and update status
  if (profile.verificationStatus === "PENDING") {
    const gateOpen = await isScoutGateOpen();
    if (gateOpen) {
      await db.scoutProfile.update({
        where: { userId: session.user.id },
        data: { verificationStatus: "VERIFICATION_REQUIRED" },
      });
      redirect("/scout/verification");
    } else {
      await db.scoutProfile.update({
        where: { userId: session.user.id },
        data: { verificationStatus: "WAITLISTED" },
      });
      redirect("/waitlist");
    }
  }

  // Waitlisted scouts get redirected to waitlist
  if (profile.verificationStatus === "WAITLISTED") {
    redirect("/waitlist");
  }

  // Allow access to verification and profile pages for unverified scouts
  // Block all other scout routes until APPROVED
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const allowedPaths = ["/scout/verification", "/scout/profile", "/scout/settings"];
  const isAllowedPath = allowedPaths.some((p) => pathname.includes(p));

  if (profile.verificationStatus !== "APPROVED" && !isAllowedPath) {
    redirect("/scout/verification");
  }

  return <>{children}</>;
}
