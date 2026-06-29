import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CastingForm } from "@/components/forms/casting-form";
import { BackLink } from "@/components/shared/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditCastingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.castingsNew");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const casting = await db.casting.findUnique({
    where: { id },
    include: { scoutProfile: true },
  });

  if (!casting || casting.scoutProfile.userId !== session.user.id) {
    redirect(`/${locale}/scout/castings`);
  }

  const initialData = {
    id: casting.id,
    title: casting.title,
    description: casting.description,
    city: casting.city || "",
    region: casting.region || "",
    castingDate: casting.castingDate?.toISOString().split("T")[0] || "",
    deadline: casting.deadline?.toISOString().split("T")[0] || "",
    requirements: casting.requirements || "",
    compensation: casting.compensation || "",
    isPaid: casting.isPaid,
    spots: casting.spots || undefined,
    castingType: casting.castingType || undefined,
    time: casting.time || "",
    address: casting.address || "",
    instructions: casting.instructions || "",
    materialsRequired: casting.materialsRequired || "",
  };

  return (
    <PageContainer>
      <BackLink href="/scout/castings" label="← Castings" />
      <PageHeader title={t("editTitle")} />
      <div className="max-w-3xl">
        <CastingForm locale={locale} initialData={initialData} />
      </div>
    </PageContainer>
  );
}
