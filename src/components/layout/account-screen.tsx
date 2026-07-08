"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Avatar } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Buildings,
  CaretRight,
  PencilSimple,
  ArrowSquareOut,
  SquaresFour,
  Plus,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

type Role = "model" | "scout" | "studio" | "admin";

export type AccountPhoto = { id: string; url: string };

type Row = { key: string; href: string; icon: PhosphorIcon };

/** Profile-defining links only (identity-related). Everything else lives in the burger menu. */
function rowsForRole(role: Role): Row[] {
  switch (role) {
    case "model":
      return [
        { key: "verification", href: "/model/verification", icon: ShieldCheck },
      ];
    case "scout":
      return [
        { key: "verification", href: "/scout/verification", icon: ShieldCheck },
      ];
    case "studio":
      return [{ key: "studios", href: "/studio/studios", icon: Buildings }];
    default:
      return [];
  }
}

const ROLE_LABEL_KEY: Record<Role, string> = {
  model: "roleModel",
  scout: "roleScout",
  studio: "roleStudio",
  admin: "roleScout",
};

const EDIT_HREF: Partial<Record<Role, string>> = {
  model: "/model/profile",
  scout: "/scout/profile",
};

interface AccountScreenProps {
  /** Public-facing profile deep link (e.g. /m/{slug}); shown as a CTA when present. */
  publicHref?: string;
  /** Model portfolio photos, rendered as an Instagram-style grid. */
  photos?: AccountPhoto[];
}

export function AccountScreen({ publicHref, photos = [] }: AccountScreenProps) {
  const { data: session } = useSession();
  const t = useTranslations("account");
  const tNav = useTranslations("nav");

  if (!session?.user) return null;

  const role = session.user.role.toLowerCase() as Role;
  const rows = rowsForRole(role);
  const editHref = EDIT_HREF[role];
  const hasCta = Boolean(editHref || publicHref);
  const isModel = role === "model";

  return (
    <div className="mx-auto w-full max-w-md pb-6 animate-fade-in lg:max-w-2xl">
      {/* Identity */}
      <header className="flex flex-col items-center gap-4 px-2 pt-2 pb-8 text-center">
        <Avatar
          src={session.user.image}
          name={session.user.name}
          size="xl"
          className="h-24 w-24 ring-1 ring-[var(--rule-strong)]"
        />
        <div className="space-y-1">
          <h1 className="font-[var(--font-display)] text-[1.75rem] leading-tight tracking-[-0.01em] text-[var(--ink)]">
            {session.user.name}
          </h1>
          <p className="text-eyebrow text-[var(--ink-3)]">{t(ROLE_LABEL_KEY[role])}</p>
          {session.user.email && (
            <p className="text-meta text-[var(--ink-3)]">{session.user.email}</p>
          )}
        </div>
        {hasCta && (
          <div className="mt-1 flex w-full max-w-xs items-center justify-center gap-2">
            {editHref && (
              <Link
                href={editHref as never}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 hairline border-[var(--rule-strong)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)] lg:min-h-0"
              >
                <PencilSimple className="h-4 w-4" weight="bold" />
                {t("editProfile")}
              </Link>
            )}
            {publicHref && (
              <Link
                href={publicHref as never}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 lg:min-h-0"
              >
                <ArrowSquareOut className="h-4 w-4" weight="bold" />
                {t("viewPublicProfile")}
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Instagram-style portfolio grid + full-screen viewer (models) */}
      {isModel && <ModelPhotoGrid photos={photos} />}

      {/* Profile-defining links */}
      {rows.length > 0 && (
        <ul className="hairline-t">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <li key={row.key}>
                <Link
                  href={row.href as never}
                  className="group flex items-center gap-4 px-1 py-4 hairline-b transition-colors hover:bg-[var(--bg-soft)]"
                >
                  <Icon className="h-[22px] w-[22px] shrink-0 text-[var(--ink-2)]" weight="regular" />
                  <span className="flex-1 text-[15px] font-medium text-[var(--ink)]">
                    {tNav(row.key as never)}
                  </span>
                  <CaretRight className="h-4 w-4 shrink-0 text-[var(--ink-3)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Instagram-style portfolio grid for the model account screen. Tapping a photo
 * opens a full-screen viewer where you scroll vertically through all photos.
 */
function ModelPhotoGrid({ photos }: { photos: AccountPhoto[] }) {
  const t = useTranslations("account");
  const tNav = useTranslations("nav");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (viewerIndex === null) return;
    document.body.style.overflow = "hidden";
    const slide = scrollRef.current?.children[viewerIndex] as HTMLElement | undefined;
    slide?.scrollIntoView({ block: "start" });
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewerIndex]);

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerIndex]);

  return (
    <div className="hairline-t">
      <div className="flex items-center justify-center gap-2 py-3 text-[var(--ink)]">
        <SquaresFour className="h-[18px] w-[18px]" weight="fill" />
        <span className="text-eyebrow">{t("portfolioTab")}</span>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setViewerIndex(i)}
              className="relative aspect-square overflow-hidden bg-[var(--bg-soft)]"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 220px"
                quality={85}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <Link
          href={"/model/portfolio" as never}
          className="flex flex-col items-center justify-center gap-3 py-14 text-center transition-colors hover:bg-[var(--bg-soft)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full hairline border-[var(--rule-strong)]">
            <Plus className="h-6 w-6 text-[var(--ink-2)]" weight="bold" />
          </span>
          <span className="text-sm font-medium text-[var(--ink)]">{t("addFirstPhoto")}</span>
        </Link>
      )}

      {/* Full-screen vertical photo viewer */}
      {mounted && viewerIndex !== null &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black animate-fade-in" role="dialog" aria-modal="true">
            <button
              type="button"
              onClick={() => setViewerIndex(null)}
              aria-label={tNav("close")}
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              style={{ top: "max(1rem, env(safe-area-inset-top))" }}
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
            <div
              ref={scrollRef}
              className="h-[100dvh] snap-y snap-mandatory overflow-y-auto overscroll-contain"
            >
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative flex h-[100dvh] w-full snap-start snap-always items-center justify-center"
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="100vw"
                    quality={90}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
