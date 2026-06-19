"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { cn, calculateAge } from "@/lib/utils";
import { ProfileImageCarousel } from "@/components/profile/profile-image-carousel";
import {
  GENDER_LABELS,
  EYE_COLOR_LABELS,
  HAIR_COLOR_LABELS,
  ETHNICITY_LABELS,
  MODEL_CATEGORY_LABELS,
  PROFESSIONAL_STATUS_LABELS,
  SPOKEN_LANGUAGES,
} from "@/config/enums";
import { VerifiedBadge } from "@/components/ui/verified-badge";

type Lang = "it" | "en";

export type ChatModelProfile = {
  id: string;
  slug: string;
  fullName: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  height: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoeSize: number | null;
  dressSize: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  ethnicity: string | null;
  categories: string[];
  professionalStatus: string | null;
  spokenLanguages: string[];
  travelAvailability: boolean;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
  followerCount: number | null;
  verificationStatus: string;
  portfolioImages: { id: string; url: string; isCover: boolean }[];
};

export type ChatScoutProfile = {
  id: string;
  businessName: string | null;
  roleTitle: string | null;
  city: string | null;
  bio: string | null;
  websiteUrl: string | null;
  socialProfileUrl: string | null;
  verificationStatus: string;
};

export type ChatStudioProfile = {
  id: string;
  businessName: string | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  websiteUrl: string | null;
  phoneNumber: string | null;
  studios: {
    id: string;
    slug: string;
    name: string;
    city: string | null;
    studioType: string;
    hourlyRate: number | null;
    dailyRate: number | null;
    images: { url: string }[];
  }[];
};

export type ProfilePanelData =
  | { kind: "model"; profile: ChatModelProfile | null }
  | { kind: "scout"; profile: ChatScoutProfile | null }
  | { kind: "studio"; profile: ChatStudioProfile | null }
  | { kind: "none" };

interface ProfilePanelProps {
  data: ProfilePanelData;
  otherUserRole: UserRole;
  onClose?: () => void;
}

export function ProfilePanel({ data }: ProfilePanelProps) {
  const t = useTranslations("components.messaging");
  const locale = useLocale();
  const lang: Lang = locale.startsWith("en") ? "en" : "it";

  return (
    <aside
      aria-label={t("profileTabs.profile")}
      className="flex h-full min-h-0 flex-col bg-[var(--bg)]"
    >
      <div className="flex h-20 items-center border-b border-[var(--rule)] px-5">
        <p className="text-[15px] font-semibold text-[var(--ink)]">
          {t("profileTabs.profile")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {data.kind === "model" && data.profile && (
          <ModelPanelBody profile={data.profile} t={t} lang={lang} />
        )}
        {data.kind === "scout" && data.profile && (
          <ScoutPanelBody profile={data.profile} t={t} />
        )}
        {data.kind === "studio" && data.profile && (
          <StudioPanelBody profile={data.profile} t={t} />
        )}
        {(data.kind === "none" ||
          ((data.kind === "model" || data.kind === "scout" || data.kind === "studio") &&
            !data.profile)) && (
          <div className="flex h-full items-center justify-center px-6 py-12 text-center">
            <p className="text-[13px] leading-[1.5] text-[var(--ink-3)]">
              {t("noProfile")}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

type T = ReturnType<typeof useTranslations<"components.messaging">>;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-eyebrow text-[var(--ink-3)]">
      {children}
    </p>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hairline-b flex items-baseline justify-between gap-3 py-2.5 last:border-b-0">
      <span className="text-eyebrow text-[var(--ink-3)]">
        {label}
      </span>
      <span className="text-[13px] text-[var(--ink)] tabular-nums">{value}</span>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center hairline bg-[var(--bg)] px-2.5 py-1 text-[11px] text-[var(--ink-2)]">
      {children}
    </span>
  );
}

function ModelPanelBody({
  profile,
  t,
  lang,
}: {
  profile: ChatModelProfile;
  t: T;
  lang: Lang;
}) {
  const age = profile.dateOfBirth
    ? calculateAge(new Date(profile.dateOfBirth))
    : null;
  const isVerified = profile.verificationStatus === "APPROVED";
  const genderLabel = profile.gender
    ? (GENDER_LABELS as Record<string, Record<string, string>>)[profile.gender]?.[lang]
    : null;
  const eyeLabel = profile.eyeColor
    ? (EYE_COLOR_LABELS as Record<string, Record<string, string>>)[profile.eyeColor]?.[lang]
    : null;
  const hairLabel = profile.hairColor
    ? (HAIR_COLOR_LABELS as Record<string, Record<string, string>>)[profile.hairColor]?.[lang]
    : null;
  const ethnicityLabel = profile.ethnicity
    ? (ETHNICITY_LABELS as Record<string, Record<string, string>>)[profile.ethnicity]?.[lang]
    : null;
  const statusLabel = profile.professionalStatus
    ? (PROFESSIONAL_STATUS_LABELS as Record<string, Record<string, string>>)[
        profile.professionalStatus
      ]?.[lang]
    : null;

  const hasMeasurements =
    profile.height ||
    profile.bust ||
    profile.waist ||
    profile.hips ||
    profile.shoeSize ||
    profile.dressSize;
  const hasAppearance = eyeLabel || hairLabel || ethnicityLabel;
  const hasSocial =
    profile.instagramUrl || profile.tiktokUrl || profile.websiteUrl;

  return (
    <div className="flex flex-col">
      <ProfileImageCarousel
        images={profile.portfolioImages}
        alt={profile.fullName || "Model"}
      />
      <div className="px-5 py-5">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-h3 text-[var(--ink)]">
          <span className="flex items-center gap-1.5">
            {profile.fullName}
            {isVerified && (
              <VerifiedBadge size={18} variant="static" aria-label={t("verified")} />
            )}
          </span>
          {age !== null && (
            <span className="text-meta text-[var(--ink-3)] tabular-nums">
              {age}
            </span>
          )}
        </h3>
        {genderLabel && (
          <p className="mt-1 text-[12px] text-[var(--ink-3)]">{genderLabel}</p>
        )}
        {(profile.city || profile.region) && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--ink-2)]">
            <MapPin className="h-3 w-3" />
            {[profile.city, profile.region].filter(Boolean).join(", ")}
          </p>
        )}
        {profile.bio && (
          <p className="mt-4 text-[13px] leading-[1.6] text-[var(--ink-2)] line-clamp-5 whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}
      </div>

      {hasMeasurements && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("measurements")}</SectionHeading>
          <div>
            {profile.height && (
              <StatRow label={t("height")} value={`${profile.height} ${t("cm")}`} />
            )}
            {profile.bust && (
              <StatRow label={t("bust")} value={`${profile.bust} ${t("cm")}`} />
            )}
            {profile.waist && (
              <StatRow label={t("waist")} value={`${profile.waist} ${t("cm")}`} />
            )}
            {profile.hips && (
              <StatRow label={t("hips")} value={`${profile.hips} ${t("cm")}`} />
            )}
            {profile.shoeSize && (
              <StatRow label={t("shoes")} value={`${profile.shoeSize} ${t("eu")}`} />
            )}
            {profile.dressSize && (
              <StatRow label={t("dressSize")} value={profile.dressSize} />
            )}
          </div>
        </div>
      )}

      {hasAppearance && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("appearance")}</SectionHeading>
          <div>
            {eyeLabel && <StatRow label={t("eyeColor")} value={eyeLabel} />}
            {hairLabel && <StatRow label={t("hairColor")} value={hairLabel} />}
            {ethnicityLabel && (
              <StatRow label={t("ethnicity")} value={ethnicityLabel} />
            )}
          </div>
        </div>
      )}

      <div className="hairline-t px-5 py-5">
        <SectionHeading>{t("professional")}</SectionHeading>
        {statusLabel && (
          <p className="mb-3 text-[13px] text-[var(--ink)]">{statusLabel}</p>
        )}
        {profile.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.categories.map((cat) => (
              <Chip key={cat}>
                {(MODEL_CATEGORY_LABELS as Record<string, Record<string, string>>)[
                  cat
                ]?.[lang] ?? cat}
              </Chip>
            ))}
          </div>
        )}
        <p className="mt-4 text-[12px] text-[var(--ink-2)]">
          {profile.travelAvailability ? t("travelYes") : t("travelNo")}
        </p>
      </div>

      {profile.spokenLanguages.length > 0 && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("languages")}</SectionHeading>
          <div className="flex flex-wrap gap-1.5">
            {profile.spokenLanguages.map((code) => {
              const langDef = SPOKEN_LANGUAGES.find((l) => l.code === code);
              return (
                <Chip key={code}>
                  {langDef?.label[lang] ?? code}
                </Chip>
              );
            })}
          </div>
        </div>
      )}

      {hasSocial && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("social")}</SectionHeading>
          <div className="flex flex-col">
            {profile.instagramUrl && (
              <SocialLink href={profile.instagramUrl} label="Instagram" />
            )}
            {profile.tiktokUrl && (
              <SocialLink href={profile.tiktokUrl} label="TikTok" />
            )}
            {profile.websiteUrl && (
              <SocialLink href={profile.websiteUrl} label="Website" />
            )}
            {profile.followerCount && profile.followerCount > 0 && (
              <p className="mt-3 font-[family-name:var(--font-jbm)] text-[11px] tabular-nums text-[var(--ink-2)]">
                {t("followers")}: {profile.followerCount.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="hairline-t px-5 py-5">
        <Link
          href={`/profile/${profile.slug}` as never}
          className={cn(
            "group flex items-center justify-between",
            "text-eyebrow text-[var(--ink)]",
            "hover:text-[var(--ink-2)] transition-colors"
          )}
        >
          {t("viewProfile")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function ScoutPanelBody({
  profile,
  t,
}: {
  profile: ChatScoutProfile;
  t: T;
}) {
  const isVerified = profile.verificationStatus === "APPROVED";
  return (
    <div className="flex flex-col">
      <div className="px-5 py-6">
        <p className="text-eyebrow text-[var(--ink-3)]">
          {t("roleScout")}
        </p>
        <h3 className="mt-2 flex items-center gap-1.5 text-h3 text-[var(--ink)]">
          <span>{profile.businessName ?? "—"}</span>
          {isVerified && (
            <VerifiedBadge size={18} variant="static" aria-label={t("verified")} />
          )}
        </h3>
        {profile.roleTitle && (
          <p className="mt-1 text-[13px] text-[var(--ink-2)]">{profile.roleTitle}</p>
        )}
        {profile.city && (
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--ink-2)]">
            <MapPin className="h-3 w-3" />
            {profile.city}
          </p>
        )}
        {!isVerified && (
          <div className="mt-4">
            <Chip>{t("unverified")}</Chip>
          </div>
        )}
        {profile.bio && (
          <p className="mt-5 text-[13px] leading-[1.6] text-[var(--ink-2)] line-clamp-5 whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}
      </div>
      {(profile.websiteUrl || profile.socialProfileUrl) && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("social")}</SectionHeading>
          <div className="flex flex-col">
            {profile.websiteUrl && (
              <SocialLink href={profile.websiteUrl} label="Website" />
            )}
            {profile.socialProfileUrl && (
              <SocialLink href={profile.socialProfileUrl} label="Profile" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StudioPanelBody({
  profile,
  t,
}: {
  profile: ChatStudioProfile;
  t: T;
}) {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-6">
        <p className="text-eyebrow text-[var(--ink-3)]">
          {t("roleStudio")}
        </p>
        <h3 className="mt-2 text-h3 text-[var(--ink)]">
          {profile.businessName ?? "—"}
        </h3>
        {(profile.city || profile.region) && (
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--ink-2)]">
            <MapPin className="h-3 w-3" />
            {[profile.city, profile.region].filter(Boolean).join(", ")}
          </p>
        )}
        {profile.bio && (
          <p className="mt-4 text-[13px] leading-[1.6] text-[var(--ink-2)] line-clamp-5 whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}
      </div>
      {profile.studios.length > 0 && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("professional")}</SectionHeading>
          <ul className="flex flex-col gap-3">
            {profile.studios.map((s) => (
              <li key={s.id} className="hairline p-3">
                <p className="text-[13px] font-medium text-[var(--ink)]">{s.name}</p>
                <p className="mt-1 text-[11px] text-[var(--ink-3)]">
                  {[s.city, s.studioType].filter(Boolean).join(" · ")}
                </p>
                {(s.hourlyRate || s.dailyRate) && (
                  <p className="mt-2 font-[family-name:var(--font-jbm)] text-[11px] tabular-nums text-[var(--ink-2)]">
                    {s.hourlyRate ? `€${s.hourlyRate}/h` : ""}
                    {s.hourlyRate && s.dailyRate ? " · " : ""}
                    {s.dailyRate ? `€${s.dailyRate}/day` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {profile.websiteUrl && (
        <div className="hairline-t px-5 py-5">
          <SectionHeading>{t("social")}</SectionHeading>
          <SocialLink href={profile.websiteUrl} label="Website" />
        </div>
      )}
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "hairline-b flex items-center justify-between gap-3 py-3 last:border-b-0",
        "text-[13px] text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
      )}
    >
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-[var(--ink-3)]" />
    </a>
  );
}
