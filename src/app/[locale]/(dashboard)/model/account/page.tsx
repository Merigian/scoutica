import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AccountScreen } from "@/components/layout/account-screen";

export default async function ModelAccountPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MODEL") redirect("/login");

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      slug: true,
      isPublished: true,
      portfolioImages: {
        orderBy: [{ isCover: "desc" }, { order: "asc" }],
        select: { id: true, url: true },
      },
    },
  });

  const publicHref =
    profile?.slug && profile.isPublished ? `/m/${profile.slug}` : undefined;

  return <AccountScreen publicHref={publicHref} photos={profile?.portfolioImages ?? []} />;
}
