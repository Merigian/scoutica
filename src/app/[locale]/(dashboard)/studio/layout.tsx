import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudioVerificationBanner } from "@/components/studio/studio-verification-banner";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDIO") {
    redirect("/login");
  }

  const profile = await db.studioProfile.findUnique({
    where: { userId: session.user.id },
    select: { verificationStatus: true, verificationNotes: true },
  });

  if (!profile) {
    redirect("/login");
  }

  const isVerified = profile.verificationStatus === "APPROVED";

  return (
    <>
      {!isVerified && (
        <StudioVerificationBanner
          status={profile.verificationStatus}
          notes={profile.verificationNotes}
        />
      )}
      {children}
    </>
  );
}
