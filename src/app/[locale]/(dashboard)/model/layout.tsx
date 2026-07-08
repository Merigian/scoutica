import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkActivationRequirements } from "@/server/services/completeness";
import { getTranslations } from "next-intl/server";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ModelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MODEL") {
    return <>{children}</>;
  }

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      status: true,
      fullName: true,
      gender: true,
      city: true,
      region: true,
      categories: true,
      height: true,
      bust: true,
      waist: true,
      hips: true,
      _count: { select: { portfolioImages: true } },
    },
  });

  if (!profile || profile.status !== "INCOMPLETE") {
    return <>{children}</>;
  }

  const t = await getTranslations("serverErrors.modelProfile");

  const { missing } = checkActivationRequirements({
    ...profile,
    portfolioImageCount: profile._count.portfolioImages,
  });

  const missingLabels: Record<string, string> = {
    fullName: t("requireFullName"),
    gender: t("requireGender"),
    region: t("requireRegion"),
    city: t("requireCity"),
    height: t("requireHeight"),
    category: t("requireCategory"),
    photos: t("requirePhotos"),
  };

  return (
    <>
      <div className="mx-auto mb-6 max-w-4xl rounded-lg border border-warning/30 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--ink)]">
              {t("activationRequirements")}
            </h3>
            <ul className="mt-2 space-y-1">
              {missing.map((key) => (
                <li key={key} className="text-sm text-[var(--ink-3)]">
                  • {missingLabels[key] ?? key}
                </li>
              ))}
            </ul>
            <Link
              href="/model/profile"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("profileNotActive")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
