import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getStudioBySlug } from "@/server/queries/studios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDIO_TYPE_LABELS, STUDIO_AMENITIES } from "@/config/enums";
import { parseWeeklyAvailability, hasAnyAvailability, DAY_KEYS } from "@/lib/studio-availability";
import { MapPin, Clock, Euro, Users, Maximize, Phone, Mail, Globe, Check } from "lucide-react";
import { StudioGallery } from "@/components/studios/studio-gallery";
import { StudioBookingForm } from "@/components/studios/studio-booking-form";
import { getStudioUnavailableDates } from "@/server/queries/studios";
import { BackLink } from "@/components/shared/back-link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);
  if (!studio) return { title: "Studio — Scoutica" };

  const cover = studio.images.find((i) => i.isCover)?.url ?? studio.images[0]?.url;
  const loc = [studio.city, studio.region].filter(Boolean).join(", ");

  return {
    title: `${studio.name}${loc ? ` — ${loc}` : ""} | Scoutica`,
    description:
      studio.description?.slice(0, 160) ||
      `${studio.name}${loc ? ` — ${loc}` : ""}. Book this studio on Scoutica.`,
    openGraph: {
      title: `${studio.name} | Scoutica`,
      description: loc ? `Photo studio — ${loc}` : "Photo studio on Scoutica",
      ...(cover && { images: [{ url: cover }] }),
    },
  };
}

export default async function StudioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.marketing.studioDetail");

  const studio = await getStudioBySlug(slug);
  if (!studio) notFound();

  const unavailable = await getStudioUnavailableDates(studio.id);

  const coverImage = studio.images.find((i) => i.isCover) ?? studio.images[0];
  const otherImages = studio.images.filter((i) => i.id !== coverImage?.id);

  const amenityLabels = studio.amenities
    .map((key) => STUDIO_AMENITIES.find((a) => a.key === key)?.label[lang])
    .filter(Boolean);

  const tw = await getTranslations("components.weeklyAvailability");
  const weekly = parseWeeklyAvailability(studio.weeklyAvailability);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <BackLink href="/studios" label={t("backToStudios")} />

      <div className="mb-10">
        <StudioGallery
          name={studio.name}
          coverImage={coverImage ? { id: coverImage.id, url: coverImage.url } : null}
          otherImages={otherImages.map((img) => ({ id: img.id, url: img.url }))}
          noPhotoText={t("noPhotos")}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          <div className="hairline-b pb-10">
            <Badge variant="outline" className="mb-4">
              {STUDIO_TYPE_LABELS[studio.studioType][lang]}
            </Badge>
            <h1 className="text-h1">{studio.name}</h1>
            {studio.city && (
              <p className="mt-4 flex items-center gap-2 text-body text-[var(--ink-2)]">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                {[studio.address, studio.city, studio.region].filter(Boolean).join(", ")}
                {studio.zipCode && ` — ${studio.zipCode}`}
              </p>
            )}
            {studio.studioProfile.businessName && (
              <p className="mt-2 text-sm text-[var(--ink-3)]">
                {t("managedBy")}{" "}
                <span className="text-[var(--ink)] font-medium">{studio.studioProfile.businessName}</span>
              </p>
            )}
          </div>

          {studio.description && (
            <div>
              <p className="text-eyebrow mb-4">{t("description")}</p>
              <p className="text-body text-[var(--ink-2)] whitespace-pre-wrap">
                {studio.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 hairline-t hairline-b py-8">
            {studio.sizeSqm && (
              <div>
                <p className="text-eyebrow mb-2 flex items-center gap-2">
                  <Maximize className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Size
                </p>
                <p className="font-display text-2xl tabular-nums text-[var(--ink)]">
                  {studio.sizeSqm} m²
                </p>
              </div>
            )}
            {studio.maxCapacity && (
              <div>
                <p className="text-eyebrow mb-2 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Capacity
                </p>
                <p className="font-display text-2xl tabular-nums text-[var(--ink)]">
                  {studio.maxCapacity} {t("people")}
                </p>
              </div>
            )}
            {studio.minHours && (
              <div>
                <p className="text-eyebrow mb-2 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Min booking
                </p>
                <p className="font-display text-2xl tabular-nums text-[var(--ink)]">
                  {studio.minHours}h
                </p>
              </div>
            )}
          </div>

          {amenityLabels.length > 0 && (
            <div>
              <p className="text-eyebrow mb-5">{t("amenities")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenityLabels.map((label) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-[var(--ink-2)]">
                    <Check className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasAnyAvailability(weekly) && (
            <div>
              <p className="text-eyebrow mb-4">{t("availability")}</p>
              <div className="space-y-1.5">
                {DAY_KEYS.filter((d) => weekly[d].length > 0).map((d) => (
                  <div key={d} className="flex gap-4 text-sm text-[var(--ink-2)]">
                    <span className="w-28 shrink-0 font-medium text-[var(--ink)]">
                      {tw(`days.${d}`)}
                    </span>
                    <span className="tabular-nums">
                      {weekly[d].map((b) => `${b.start}–${b.end}`).join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(studio.contactEmail || studio.contactPhone || studio.studioProfile.websiteUrl) && (
            <div className="hairline-t pt-10">
              <p className="text-eyebrow mb-5">{t("directContact")}</p>
              <div className="space-y-3">
                {studio.contactEmail && (
                  <a href={`mailto:${studio.contactEmail}`} className="flex items-center gap-3 text-sm text-[var(--ink-2)] hover:text-[var(--accent)] transition-colors">
                    <Mail className="h-4 w-4" />
                    {studio.contactEmail}
                  </a>
                )}
                {studio.contactPhone && (
                  <a href={`tel:${studio.contactPhone}`} className="flex items-center gap-3 text-sm text-[var(--ink-2)] hover:text-[var(--accent)] transition-colors">
                    <Phone className="h-4 w-4" />
                    {studio.contactPhone}
                  </a>
                )}
                {studio.studioProfile.websiteUrl && (
                  <a
                    href={studio.studioProfile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[var(--ink-2)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    {studio.studioProfile.websiteUrl}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-[var(--accent)]" />
                {t("rates")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studio.hourlyRate && (
                <div className="flex items-baseline justify-between hairline-b pb-3">
                  <span className="text-eyebrow text-[var(--ink-3)]">{t("hourlyRate")}</span>
                  <span className="font-display text-xl tabular-nums text-[var(--ink)]">
                    €{studio.hourlyRate}
                  </span>
                </div>
              )}
              {studio.dailyRate && (
                <div className="flex items-baseline justify-between hairline-b pb-3">
                  <span className="text-eyebrow text-[var(--ink-3)]">{t("dailyRate")}</span>
                  <span className="font-display text-xl tabular-nums text-[var(--ink)]">
                    €{studio.dailyRate}
                  </span>
                </div>
              )}
              {studio.weeklyRate && (
                <div className="flex items-baseline justify-between">
                  <span className="text-eyebrow text-[var(--ink-3)]">{t("weeklyRate")}</span>
                  <span className="font-display text-xl tabular-nums text-[var(--ink)]">
                    €{studio.weeklyRate}
                  </span>
                </div>
              )}
              {!studio.hourlyRate && !studio.dailyRate && !studio.weeklyRate && (
                <p className="text-sm text-[var(--ink-3)]">{t("contactForPricing")}</p>
              )}
            </CardContent>
          </Card>

          <StudioBookingForm
            studioId={studio.id}
            lang={lang}
            dailyRate={studio.dailyRate}
            weeklyRate={studio.weeklyRate}
            hourlyRate={studio.hourlyRate}
            blockedDates={unavailable.blockedDates}
            bookedDates={unavailable.bookedDates}
            bookedTimeSlots={unavailable.bookedTimeSlots}
          />
        </div>
      </div>
    </div>
  );
}
