import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ModelProfileForm } from "@/components/forms/model-profile-form";
import { CompletenessScore } from "@/components/model/completeness-score";
import { PublishControl } from "@/components/model/publish-control";
import { ProfilePhotos } from "@/components/model/profile-photos";

export default async function ModelProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MODEL") redirect("/login");

  const locale = await getLocale();
  const t = await getTranslations("pages.model.profile");

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      portfolioImages: { orderBy: { order: "asc" }, select: { id: true, url: true, isCover: true, order: true } },
      _count: { select: { portfolioImages: true } },
    },
  });

  if (!profile) redirect("/login");

  const hasCover = profile.portfolioImages.some((img) => img.isCover);

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-h2">
          {t("title")}
        </h1>
        <p className="mt-1 text-[var(--ink-3)]">
          {t("description")}
        </p>
      </div>

      {/* Completeness Score */}
      <CompletenessScore score={profile.completenessScore} />

      {/* Profile Photos */}
      <ProfilePhotos photos={profile.portfolioImages} />

      {/* Profile Form */}
      <ModelProfileForm
        profile={{
          firstName: profile.fullName?.split(" ")[0] ?? "",
          lastName: profile.fullName?.split(" ").slice(1).join(" ") ?? "",
          bio: profile.bio,
          dateOfBirth: profile.dateOfBirth?.toISOString().split("T")[0] ?? null,
          gender: profile.gender,
          city: profile.city,
          region: profile.region,
          height: profile.height,
          bust: profile.bust,
          waist: profile.waist,
          hips: profile.hips,
          shoeSize: profile.shoeSize,
          dressSize: profile.dressSize,
          eyeColor: profile.eyeColor,
          hairColor: profile.hairColor,
          ethnicity: profile.ethnicity,
          categories: profile.categories,
          professionalStatus: profile.professionalStatus,
          spokenLanguages: profile.spokenLanguages,
          travelAvailability: profile.travelAvailability,
          instagramUrl: profile.instagramUrl?.replace(/^https?:\/\/(www\.)?instagram\.com\//, "") ?? null,
          tiktokUrl: profile.tiktokUrl?.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/, "") ?? null,
          youtubeUrl: profile.youtubeUrl?.replace(/^https?:\/\/(www\.)?youtube\.com\/@?/, "") ?? null,
          xUrl: profile.xUrl?.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "") ?? null,
          websiteUrl: profile.websiteUrl,
          followerCount: profile.followerCount,
          visibility: profile.visibility,
        }}
      />

      {/* Publish Control */}
      <PublishControl
        isPublished={profile.isPublished}
        publishedAt={profile.publishedAt}
        dateOfBirth={profile.dateOfBirth}
        fullName={profile.fullName}
        imageCount={profile._count.portfolioImages}
        hasCover={hasCover}
        status={profile.status}
      />
    </div>
  );
}
