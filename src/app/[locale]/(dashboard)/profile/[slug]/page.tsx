import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getModelProfileBySlug } from "@/server/queries/model-profiles";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableCover } from "@/components/ui/clickable-cover";
import { ClickableGallery } from "@/components/ui/clickable-gallery";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  GENDER_LABELS,
  EYE_COLOR_LABELS,
  HAIR_COLOR_LABELS,
  ETHNICITY_LABELS,
  MODEL_CATEGORY_LABELS,
  PROFESSIONAL_STATUS_LABELS,
} from "@/config/enums";
import { calculateAge, formatDate, toPublicModelName } from "@/lib/utils";
import {
  MapPin,
  Ruler,
  Palette,
  Globe2,
  Instagram,
  Calendar,
  Briefcase,
  Languages,
  Plane,
  User,
  ShieldCheck,
  Music2,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { PublicProfileContactButton } from "@/components/profile/public-profile-contact-button";
import { recordProfileView } from "@/server/actions/profile-engagement";
import { BackLink } from "@/components/shared/back-link";
import { ReportBlockMenu } from "@/components/shared/report-block-menu";
import { PrivateNoteCard } from "@/components/scout/private-note-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getModelProfileBySlug(slug);
  if (!profile) return { title: "Profile — Scoutica" };

  const name = toPublicModelName(profile.fullName) || "Model";
  const city = profile.city || "";
  const height = profile.height ? `${profile.height}cm` : "";
  const cover = profile.portfolioImages.find((i) => i.isCover)?.url;

  return {
    title: `${name} — ${city} | Scoutica`,
    description: `${name}${height ? `, ${height}` : ""}${city ? `, ${city}` : ""}. Professional portfolio on Scoutica — Italy's fashion talent platform.`,
    openGraph: {
      title: `${name} | Scoutica`,
      description: `Professional model portfolio${city ? ` — ${city}` : ""}`,
      ...(cover && { images: [{ url: cover }] }),
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.publicProfile");
  const session = await auth();
  const { slug } = await params;

  const profile = await getModelProfileBySlug(slug);
  if (!profile) notFound();

  // Record view (fire-and-forget, don't block render)
  recordProfileView(profile.id).catch(() => {});

  const isAuthenticated = !!session?.user?.id;
  const isOwnProfile = session?.user?.id === profile.user.id;
  // Owner sees their own full name; everyone else sees the surname initial only.
  const displayName = isOwnProfile
    ? profile.fullName
    : toPublicModelName(profile.fullName);

  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const isBoosted = profile.boosts.length > 0;
  const isVerified = profile.verificationStatus === "APPROVED";
  const isScout = session?.user?.role === "SCOUT";
  // Social links (Instagram/TikTok/website/followers) must not be visible to
  // other models — only the owner and non-model viewers (scouts/studios/admin).
  const canSeeSocials = isOwnProfile || session?.user?.role !== "MODEL";
  const lastActive = profile.user.lastActiveAt;
  const activeRecently = lastActive
    ? Date.now() - new Date(lastActive).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  // Check existing contact request status for scouts
  let existingConversationId: string | null = null;
  let contactRequestStatus: string | null = null;
  let privateNoteContent: string | null = null;
  if (isScout && session?.user?.id) {
    const scoutProfile = await db.scoutProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (scoutProfile) {
      const existing = await db.contactRequest.findUnique({
        where: {
          scoutProfileId_modelProfileId: {
            scoutProfileId: scoutProfile.id,
            modelProfileId: profile.id,
          },
        },
        select: { status: true, conversationId: true },
      });
      if (existing) {
        contactRequestStatus = existing.status;
        existingConversationId = existing.conversationId;
      }

      const note = await db.privateNote.findUnique({
        where: {
          scoutProfileId_modelProfileId: {
            scoutProfileId: scoutProfile.id,
            modelProfileId: profile.id,
          },
        },
        select: { content: true },
      });
      privateNoteContent = note?.content ?? "";
    }

    // Also check for a direct conversation (not created via contact request)
    if (!existingConversationId) {
      const existingConv = await db.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: profile.user.id } } },
          ],
        },
        select: { id: true },
      });
      if (existingConv) {
        existingConversationId = existingConv.id;
        contactRequestStatus = "ACCEPTED";
      }
    }
  }

  // Stats for display
  const stats = [
    profile.height ? { label: t("height"), value: `${profile.height} cm`, icon: Ruler } : null,
    profile.bust ? { label: t("bust"), value: `${profile.bust} cm` } : null,
    profile.waist ? { label: t("waist"), value: `${profile.waist} cm` } : null,
    profile.hips ? { label: t("hips"), value: `${profile.hips} cm` } : null,
    profile.shoeSize ? { label: t("shoes"), value: String(profile.shoeSize) } : null,
    profile.dressSize ? { label: t("dressSize"), value: profile.dressSize } : null,
  ].filter(Boolean);

  const backHref = isScout ? "/scout/discover" : "/";
  const backLabel = isScout
    ? t("backToSearch")
    : t("back");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <BackLink href={backHref} label={backLabel} />
        {session?.user && session.user.id !== profile.userId && (
          <ReportBlockMenu targetUserId={profile.userId} locale={locale} />
        )}
      </div>

      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Cover image */}
        <div className="md:w-1/3 aspect-[3/4] max-h-[60vh] md:max-h-none overflow-hidden bg-[var(--bg-soft)] relative hairline">
          {profile.portfolioImages.find((i) => i.isCover) ? (
            <ClickableCover
              coverUrl={profile.portfolioImages.find((i) => i.isCover)!.url}
              allImages={profile.portfolioImages.map((img) => ({ url: img.url, alt: displayName || "Model" }))}
              coverIndex={profile.portfolioImages.findIndex((i) => i.isCover)}
              alt={displayName || "Model"}
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <User className="h-16 w-16 text-[var(--ink-3)]/30" />
            </div>
          )}
          {isBoosted && (
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="gap-1">
                <ShieldCheck className="h-3 w-3" /> {t("featured")}
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-display font-medium">
                {displayName || t("unnamed")}
              </h1>
              {isVerified && (
                <VerifiedBadge size={24} aria-label={t("verified")} />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--ink-3)]">
              {age && <span>{age} {t("years")}</span>}
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.city}{profile.region ? `, ${profile.region}` : ""}
                </span>
              )}
              {activeRecently && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--success)]"
                    aria-hidden="true"
                  />
                  {t("activeRecently")}
                </span>
              )}
            </div>
          </div>

          {/* Categories */}
          {profile.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {MODEL_CATEGORY_LABELS[cat as keyof typeof MODEL_CATEGORY_LABELS]?.[lang] ?? cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 text-sm">
            {profile.gender && (
              <Badge variant="outline">
                {GENDER_LABELS[profile.gender as keyof typeof GENDER_LABELS]?.[lang]}
              </Badge>
            )}
            {profile.professionalStatus && (
              <Badge variant="outline">
                <Briefcase className="h-3 w-3 mr-1" />
                {PROFESSIONAL_STATUS_LABELS[profile.professionalStatus as keyof typeof PROFESSIONAL_STATUS_LABELS]?.[lang]}
              </Badge>
            )}
            {profile.travelAvailability && (
              <Badge variant="outline">
                <Plane className="h-3 w-3 mr-1" />
                {t("availableToTravel")}
              </Badge>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-[var(--ink-3)] leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          )}

          {/* Contact button for scouts */}
          {isScout && (
            <PublicProfileContactButton
              modelProfileId={profile.id}
              modelName={displayName ?? "Model"}
              locale={locale}
              existingConversationId={existingConversationId}
              contactRequestStatus={contactRequestStatus}
            />
          )}

          {/* Private note for scouts */}
          {isScout && privateNoteContent !== null && (
            <PrivateNoteCard
              modelProfileId={profile.id}
              initialContent={privateNoteContent}
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Measurements grid */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              {t("measurements")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {stats.map((stat: any, i: number) => (
                <div key={i} className="text-center p-3 bg-[var(--bg-soft)] border border-[var(--rule)]">
                  <p className="text-xs text-[var(--ink-3)]">{stat.label}</p>
                  <p className="font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance */}
      {(profile.eyeColor || profile.hairColor || profile.ethnicity) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t("appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {profile.eyeColor && (
                <div>
                  <p className="text-xs text-[var(--ink-3)]">{t("eyes")}</p>
                  <p className="font-medium">
                    {EYE_COLOR_LABELS[profile.eyeColor as keyof typeof EYE_COLOR_LABELS]?.[lang]}
                  </p>
                </div>
              )}
              {profile.hairColor && (
                <div>
                  <p className="text-xs text-[var(--ink-3)]">{t("hair")}</p>
                  <p className="font-medium">
                    {HAIR_COLOR_LABELS[profile.hairColor as keyof typeof HAIR_COLOR_LABELS]?.[lang]}
                  </p>
                </div>
              )}
              {profile.ethnicity && (
                <div>
                  <p className="text-xs text-[var(--ink-3)]">{t("ethnicity")}</p>
                  <p className="font-medium">
                    {ETHNICITY_LABELS[profile.ethnicity as keyof typeof ETHNICITY_LABELS]?.[lang]}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      {profile.portfolioImages.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold mb-4">
            {t("portfolio")}
          </h2>
          <ClickableGallery
            images={profile.portfolioImages
              .filter((img) => !img.isCover)
              .map((img) => ({ id: img.id, url: img.url, alt: "Portfolio" }))}
          />
        </div>
      )}

      {/* Social links */}
      {canSeeSocials && (profile.instagramUrl || profile.tiktokUrl || profile.websiteUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              {t("socialTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[var(--ink)] link-underline"
                >
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              )}
              {profile.tiktokUrl && (
                <a
                  href={profile.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[var(--ink)] link-underline"
                >
                  <Music2 className="h-4 w-4" /> TikTok
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[var(--ink)] link-underline"
                >
                  <Globe2 className="h-4 w-4" /> {t("website")}
                </a>
              )}
            </div>
            {/* Numero follower nascosto per il momento (campo e dati mantenuti) */}
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {profile.spokenLanguages.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Languages className="h-4 w-4 text-[var(--ink-3)]" />
          <span className="text-[var(--ink-3)]">{t("languages")}:</span>
          {profile.spokenLanguages.join(", ")}
        </div>
      )}

      {/* Member since */}
      <p className="text-xs text-[var(--ink-3)]">
        {t("memberSince")} {formatDate(profile.user.createdAt, lang)}
      </p>
    </div>
  );
}
