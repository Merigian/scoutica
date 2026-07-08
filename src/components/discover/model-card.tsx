"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ModelProfileCard } from "@/server/queries/model-profiles";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  PROFESSIONAL_STATUS_LABELS,
  GENDER_LABELS,
  EYE_COLOR_LABELS,
  HAIR_COLOR_LABELS,
  ETHNICITY_LABELS,
} from "@/config/enums";
import type {
  ProfessionalStatus,
  Gender,
  EyeColor,
  HairColor,
  Ethnicity,
  ContactRequestStatus,
} from "@prisma/client";
import { calculateAge, formatRelativeTime, formatDate } from "@/lib/utils";
import {
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Camera,
  Clock,
  Ruler,
  Briefcase,
  Plane,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import {
  BookmarkSimple,
  ChatCircle,
  DotsThree,
  UserCircle,
} from "@phosphor-icons/react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLiveCols } from "@/components/discover/grid-density-selector";
import { toggleProfileBookmark } from "@/server/actions/profile-engagement";
import { ContactRequestForm } from "@/components/forms/contact-request-form";
import { ActionSheet, type ActionSheetAction } from "@/components/ui/action-sheet";

interface ModelCardProps {
  profile: ModelProfileCard;
  locale: string;
  isAuthenticated?: boolean;
  initialSaved?: boolean;
  canContact?: boolean;
  contactStatus?: ContactRequestStatus | null;
  conversationId?: string | null;
  aspectVariant?: "portrait" | "tall" | "square";
  /** Show the save/bookmark control. Off for the model inspiration grid. */
  showSave?: boolean;
}

interface ProfileImageProps {
  images: string[];
  alt: string;
  sizes: string;
  isBoosted: boolean;
  featuredLabel: string;
  showGradient: boolean;
}

function ProfileImage({
  images,
  alt,
  sizes,
  isBoosted,
  featuredLabel,
  showGradient,
}: ProfileImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const step = (dir: "prev" | "next") => {
    setCurrentIndex((prev) =>
      dir === "next"
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );
  };

  const go = (e: React.MouseEvent, dir: "prev" | "next") => {
    e.preventDefault();
    e.stopPropagation();
    step(dir);
  };

  return (
    <div className="absolute inset-0">
      {images.length > 0 ? (
        <Image
          src={images[currentIndex]}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes={sizes}
          quality={88}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <User className="h-10 w-10 text-[var(--ink-3)]/40" />
        </div>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => go(e, "prev")}
            className="nav-zone absolute inset-y-0 left-0 z-10 flex w-1/3 items-center justify-start pl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-inset"
          >
            <ChevronLeft className="nav-arrow h-7 w-7 text-white" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => go(e, "next")}
            className="nav-zone absolute inset-y-0 right-0 z-10 flex w-1/3 items-center justify-end pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-inset"
          >
            <ChevronRight className="nav-arrow h-7 w-7 text-white" strokeWidth={1.5} />
          </button>

          <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}

      {isBoosted && (
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          <span className="inline-flex items-center border border-white/25 bg-black/35 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {featuredLabel}
          </span>
        </div>
      )}

      {showGradient && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}
    </div>
  );
}

interface RowActionsProps {
  profileId: string;
  profileName: string;
  locale: string;
  isAuthenticated: boolean;
  initialSaved: boolean;
  canContact: boolean;
  contactStatus: ContactRequestStatus | null;
  conversationId: string | null;
  showSave?: boolean;
}

function RowActions({
  profileId,
  profileName,
  locale,
  isAuthenticated,
  initialSaved,
  canContact,
  contactStatus,
  conversationId,
  showSave = true,
}: RowActionsProps) {
  const t = useTranslations("components.discover");
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const [contactOpen, setContactOpen] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleProfileBookmark(profileId);
      if (res.success && res.data) {
        setSaved(res.data.saved);
      } else {
        setSaved(!next);
      }
    });
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (contactStatus === "ACCEPTED" && conversationId) {
      router.push(`/${locale}/scout/messages?chat=${conversationId}`);
      return;
    }
    if (contactStatus === "PENDING") return;
    setContactOpen(true);
  };

  const bookmarkLabel = saved ? t("removeFromFavorites") : t("addToFavorites");
  const contactLabel =
    contactStatus === "ACCEPTED"
      ? t("goToChat")
      : contactStatus === "PENDING"
        ? t("requestPending")
        : t("contact");

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        {showSave && (
          <button
            type="button"
            onClick={handleBookmark}
            disabled={isPending}
            aria-label={bookmarkLabel}
            title={bookmarkLabel}
            className={cn(
              "flex h-11 w-11 items-center justify-center border border-[var(--rule)] bg-[var(--bg)] transition-colors lg:h-10 lg:w-10",
              "hover:border-[var(--rule-strong)] hover:bg-[var(--bg-soft)]",
              saved ? "text-[var(--accent)]" : "text-[var(--ink-2)]",
              isPending && "opacity-60"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        )}
        {canContact && (
          <button
            type="button"
            onClick={handleContact}
            disabled={contactStatus === "PENDING"}
            aria-label={contactLabel}
            title={contactLabel}
            className={cn(
              "flex h-11 w-11 items-center justify-center border border-[var(--rule)] bg-[var(--bg)] transition-colors lg:h-10 lg:w-10",
              "hover:border-[var(--rule-strong)] hover:bg-[var(--bg-soft)]",
              contactStatus === "ACCEPTED"
                ? "text-[var(--accent)]"
                : "text-[var(--ink-2)]",
              contactStatus === "PENDING" && "cursor-not-allowed opacity-60"
            )}
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      {canContact && (
        <ContactRequestForm
          modelProfileId={profileId}
          modelName={profileName}
          locale={locale}
          open={contactOpen}
          onOpenChange={setContactOpen}
        />
      )}
    </>
  );
}

interface GridBookmarkButtonProps {
  profileId: string;
  locale: string;
  isAuthenticated: boolean;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
}

/** Optimistic bookmark toggle shared by the grid overlay and the context sheet. */
function useBookmarkToggle({
  profileId,
  locale,
  isAuthenticated,
  saved,
  onSavedChange,
}: GridBookmarkButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    const next = !saved;
    onSavedChange(next);
    startTransition(async () => {
      const res = await toggleProfileBookmark(profileId);
      if (res.success && res.data) {
        onSavedChange(res.data.saved);
      } else {
        onSavedChange(!next);
      }
    });
  };

  return { toggle, isPending };
}

function GridBookmarkButton(props: GridBookmarkButtonProps) {
  const t = useTranslations("components.discover");
  const { saved } = props;
  const { toggle, isPending } = useBookmarkToggle(props);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  const label = saved ? t("removeFromFavorites") : t("addToFavorites");

  return (
    <button
      type="button"
      onClick={handleBookmark}
      disabled={isPending}
      aria-label={label}
      title={label}
      className={cn(
        "absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center",
        "transition-[opacity,transform,color] duration-150 hover:scale-110 active:scale-95",
        saved ? "text-[var(--accent-soft)]" : "text-white",
        !saved &&
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100",
        isPending && "opacity-60"
      )}
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.55))" }}
    >
      <Bookmark className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

interface GridCardActionsProps extends GridBookmarkButtonProps {
  profileName: string;
  slug: string;
  showSave: boolean;
  canContact: boolean;
  contactStatus: ContactRequestStatus | null;
  conversationId: string | null;
}

/**
 * Mobile "…" on grid cards → iOS context sheet (view profile / save /
 * contact). Wrapped so sheet taps never bubble into the card's Link.
 */
function GridCardActions(props: GridCardActionsProps) {
  const {
    profileId,
    profileName,
    slug,
    locale,
    saved,
    showSave,
    canContact,
    contactStatus,
    conversationId,
  } = props;
  const t = useTranslations("components.discover");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { toggle, isPending } = useBookmarkToggle(props);

  const iconCls = "h-[22px] w-[22px]";
  const contactLabel =
    contactStatus === "ACCEPTED"
      ? t("goToChat")
      : contactStatus === "PENDING"
        ? t("requestPending")
        : t("contact");

  const actions: ActionSheetAction[] = [
    {
      key: "view",
      label: t("viewProfile"),
      icon: <UserCircle className={iconCls} />,
      onSelect: () => router.push(`/${locale}/profile/${slug}`),
    },
    ...(showSave
      ? [
          {
            key: "save",
            label: saved ? t("removeFromFavorites") : t("addToFavorites"),
            icon: <BookmarkSimple className={iconCls} weight={saved ? "fill" : "regular"} />,
            disabled: isPending,
            onSelect: toggle,
          },
        ]
      : []),
    ...(canContact
      ? [
          {
            key: "contact",
            label: contactLabel,
            icon: <ChatCircle className={iconCls} />,
            disabled: contactStatus === "PENDING",
            onSelect: () => {
              if (contactStatus === "ACCEPTED" && conversationId) {
                router.push(`/${locale}/scout/messages?chat=${conversationId}`);
              } else {
                setContactOpen(true);
              }
            },
          },
        ]
      : []),
  ];

  return (
    <span className="contents" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={t("moreActions")}
        aria-haspopup="dialog"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="-mr-1.5 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-[var(--ink-3)] transition-colors active:text-[var(--ink)] lg:hidden"
      >
        <DotsThree className="h-6 w-6" weight="bold" />
      </button>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={profileName}
        actions={actions}
        cancelLabel={tCommon("cancel")}
      />
      {canContact && (
        <ContactRequestForm
          modelProfileId={profileId}
          modelName={profileName}
          locale={locale}
          open={contactOpen}
          onOpenChange={setContactOpen}
        />
      )}
    </span>
  );
}

export function ModelCard({
  profile,
  locale,
  isAuthenticated = false,
  initialSaved = false,
  canContact = false,
  contactStatus = null,
  conversationId = null,
  aspectVariant = "portrait",
  showSave = true,
}: ModelCardProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.discover");
  const cols = useLiveCols(4);
  const [gridSaved, setGridSaved] = useState(initialSaved);
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const images =
    profile.images.length > 0
      ? profile.images
      : profile.coverImage
        ? [profile.coverImage]
        : [];
  const verifiedLabel = t("featured");
  const verifiedRealLabel = t("verified");
  const name = profile.fullName || t("unnamed");
  const gridMeta = [
    age !== null ? String(age) : null,
    profile.city,
    profile.height !== null ? `${profile.height} cm` : null,
  ]
    .filter(Boolean)
    .join(" \u00b7 ");
  const statusLabel = profile.professionalStatus
    ? PROFESSIONAL_STATUS_LABELS[profile.professionalStatus as ProfessionalStatus]?.[lang]
    : null;
  const genderLabel = profile.gender
    ? GENDER_LABELS[profile.gender as Gender]?.[lang]
    : null;
  const eyeLabel = profile.eyeColor
    ? EYE_COLOR_LABELS[profile.eyeColor as EyeColor]?.[lang]
    : null;
  const hairLabel = profile.hairColor
    ? HAIR_COLOR_LABELS[profile.hairColor as HairColor]?.[lang]
    : null;
  const ethnicityLabel = profile.ethnicity
    ? ETHNICITY_LABELS[profile.ethnicity as Ethnicity]?.[lang]
    : null;
  const locationParts = [profile.city, profile.region].filter(Boolean) as string[];
  const hasMeasurements =
    profile.height !== null ||
    profile.bust !== null ||
    profile.waist !== null ||
    profile.hips !== null ||
    profile.shoeSize !== null ||
    profile.dressSize !== null;
  const hasAppearance = !!(eyeLabel || hairLabel || ethnicityLabel);

  if (cols === 1) {
    const photoCount = profile.imageCount || images.length;
    return (
      <Link
        href={`/${locale}/profile/${profile.slug}`}
        className="group block transition-colors hover:bg-[var(--bg-soft)]"
      >
        <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row md:gap-8 md:p-8">
          <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-[var(--bg-soft)] md:w-72 lg:w-80 xl:w-96">
            <ProfileImage
              images={images}
              alt={name}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 18rem, (max-width: 1280px) 20rem, 24rem"
              isBoosted={profile.isBoosted}
              featuredLabel={verifiedLabel}
              showGradient={false}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <header className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="flex items-center gap-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-[var(--ink)]">
                    {name}
                    {profile.isVerified && (
                      <VerifiedBadge
                        size={18}
                        className="shrink-0 text-[var(--ink-2)]"
                        aria-label={verifiedRealLabel}
                      />
                    )}
                  </h3>
                  {age !== null && (
                    <span
                      className="text-mono-num text-2xl text-[var(--ink-2)]"
                      suppressHydrationWarning
                    >
                      {age}
                    </span>
                  )}
                </div>
                {(showSave || canContact) && (
                  <RowActions
                    profileId={profile.id}
                    profileName={name}
                    locale={locale}
                    isAuthenticated={isAuthenticated}
                    initialSaved={initialSaved}
                    canContact={canContact}
                    contactStatus={contactStatus}
                    conversationId={conversationId}
                    showSave={showSave}
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ink-3)]">
                {locationParts.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{locationParts.join(" · ")}</span>
                  </span>
                )}
                {genderLabel && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 shrink-0" />
                    {genderLabel}
                  </span>
                )}
                {statusLabel && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    {statusLabel}
                  </span>
                )}
                {profile.travelAvailability && (
                  <span className="flex items-center gap-1.5 text-[var(--ink-2)]">
                    <Plane className="h-4 w-4 shrink-0" />
                    {t("travel")}
                  </span>
                )}
              </div>
            </header>

            {hasMeasurements && (
              <section className="hairline-t pt-4">
                <div className="mb-2 flex items-center gap-1.5 text-eyebrow text-[var(--ink-3)]">
                  <Ruler className="h-3 w-3" />
                  {t("measurements")}
                </div>
                <dl className="grid grid-cols-3 gap-x-6 gap-y-3 sm:grid-cols-6">
                  {profile.height !== null && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("height")}</dt>
                      <dd className="text-mono-num text-sm text-[var(--ink)]">
                        {profile.height} cm
                      </dd>
                    </div>
                  )}
                  {profile.bust !== null && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("bust")}</dt>
                      <dd className="text-mono-num text-sm text-[var(--ink)]">
                        {profile.bust} cm
                      </dd>
                    </div>
                  )}
                  {profile.waist !== null && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("waist")}</dt>
                      <dd className="text-mono-num text-sm text-[var(--ink)]">
                        {profile.waist} cm
                      </dd>
                    </div>
                  )}
                  {profile.hips !== null && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("hips")}</dt>
                      <dd className="text-mono-num text-sm text-[var(--ink)]">
                        {profile.hips} cm
                      </dd>
                    </div>
                  )}
                  {profile.shoeSize !== null && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("shoeSize")}</dt>
                      <dd className="text-mono-num text-sm text-[var(--ink)]">
                        {profile.shoeSize}
                      </dd>
                    </div>
                  )}
                  {profile.dressSize && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("dressSize")}</dt>
                      <dd className="text-sm text-[var(--ink)]">{profile.dressSize}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {hasAppearance && (
              <section className="hairline-t pt-4">
                <div className="mb-2 text-eyebrow text-[var(--ink-3)]">
                  {t("appearance")}
                </div>
                <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
                  {eyeLabel && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("eyes")}</dt>
                      <dd className="text-sm text-[var(--ink)]">{eyeLabel}</dd>
                    </div>
                  )}
                  {hairLabel && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("hair")}</dt>
                      <dd className="text-sm text-[var(--ink)]">{hairLabel}</dd>
                    </div>
                  )}
                  {ethnicityLabel && (
                    <div>
                      <dt className="text-xs text-[var(--ink-3)]">{t("ethnicity")}</dt>
                      <dd className="text-sm text-[var(--ink)]">{ethnicityLabel}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {profile.spokenLanguages && profile.spokenLanguages.length > 0 && (
              <section className="hairline-t pt-4">
                <div className="mb-2 text-eyebrow text-[var(--ink-3)]">
                  {t("languages")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.spokenLanguages.map((lng) => (
                    <Badge key={lng} variant="outline" className="text-xs">
                      {lng}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <div className="hairline-t flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 text-sm text-[var(--ink-2)]">
              <span
                className="flex items-center gap-1.5"
                title={t("photos")}
                aria-label={t("photos")}
              >
                <Camera className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                <span className="text-mono-num">{photoCount}</span>
              </span>
              {profile.lastActiveAt && (
                <span
                  className="flex items-center gap-1.5"
                  title={t("lastActive")}
                  aria-label={t("lastActive")}
                  suppressHydrationWarning
                >
                  <Clock className="h-3.5 w-3.5 text-[var(--ink-3)]" />
                  {formatRelativeTime(profile.lastActiveAt, locale)}
                </span>
              )}
              <span className="ml-auto text-xs text-[var(--ink-3)]" suppressHydrationWarning>
                {t("memberSince")}{" "}
                {formatDate(profile.createdAt, lang === "en" ? "en-US" : "it-IT")}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/profile/${profile.slug}`}>
      <Card className="group relative border-transparent bg-transparent transition-colors duration-200 hover:bg-[var(--bg-soft)]">
        <div
          className={cn(
            "relative overflow-hidden border border-[var(--rule)] bg-[var(--bg-soft)] transition-colors duration-200 group-hover:border-[var(--rule-strong)]",
            aspectVariant === "square" && "aspect-square",
            aspectVariant === "tall" && "aspect-[4/5]",
            aspectVariant === "portrait" && "aspect-[3/4]",
          )}
        >
          <ProfileImage
            images={images}
            alt={name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            isBoosted={profile.isBoosted}
            featuredLabel={verifiedLabel}
            showGradient
          />
          {showSave && (
            <GridBookmarkButton
              profileId={profile.id}
              locale={locale}
              isAuthenticated={isAuthenticated}
              saved={gridSaved}
              onSavedChange={setGridSaved}
            />
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100"
          />
        </div>

        <div className="flex items-start justify-between gap-1 px-1 pt-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate font-display text-[1.0625rem] font-medium leading-snug tracking-[-0.01em] text-[var(--ink)]">
                {name}
              </h3>
              {profile.isVerified && (
                <VerifiedBadge
                  size={15}
                  className="shrink-0 text-[var(--ink-2)]"
                  aria-label={verifiedRealLabel}
                />
              )}
            </div>

            {gridMeta && (
              <p className="text-meta text-[var(--ink-3)]" suppressHydrationWarning>
                {gridMeta}
              </p>
            )}
          </div>
          <GridCardActions
            profileId={profile.id}
            profileName={name}
            slug={profile.slug}
            locale={locale}
            isAuthenticated={isAuthenticated}
            saved={gridSaved}
            onSavedChange={setGridSaved}
            showSave={showSave}
            canContact={canContact}
            contactStatus={contactStatus}
            conversationId={conversationId}
          />
        </div>
      </Card>
    </Link>
  );
}
