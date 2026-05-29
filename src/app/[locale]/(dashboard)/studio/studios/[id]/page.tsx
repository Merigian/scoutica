import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getStudioWithImages, getStudioUnavailableDates } from "@/server/queries/studios";
import { StudioEditForm } from "@/components/studio/studio-edit-form";
import { StudioPhotos } from "@/components/studio/studio-photos";
import { StudioPublishBar } from "@/components/studio/studio-publish-bar";
import { StudioAvailability } from "@/components/studio/studio-availability";
import { BackLink } from "@/components/shared/back-link";

export default async function StudioEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user || session.user.role !== "STUDIO") {
    redirect(`/${locale}/login`);
  }

  const studio = await getStudioWithImages(id, session.user.id);
  if (!studio) {
    redirect(`/${locale}/studio/studios`);
  }

  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.studio.studioDetail");
  const unavailable = await getStudioUnavailableDates(studio.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackLink href="/studio/studios" label={t("backToStudios")} />

      <StudioPublishBar studio={studio} />
      <StudioPhotos studioId={studio.id} images={studio.images} />
      <StudioAvailability
        studioId={studio.id}
        lang={lang as "it" | "en"}
        blockedDates={unavailable.blockedDates}
        bookedDates={unavailable.bookedDates}
        blockedRecords={unavailable.blockedRecords}
      />
      <StudioEditForm studio={studio} />
    </div>
  );
}
