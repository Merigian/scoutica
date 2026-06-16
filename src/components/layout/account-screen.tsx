"use client";

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
                className="flex flex-1 items-center justify-center gap-2 hairline border-[var(--rule-strong)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)]"
              >
                <PencilSimple className="h-4 w-4" weight="bold" />
                {t("editProfile")}
              </Link>
            )}
            {publicHref && (
              <Link
                href={publicHref as never}
                className="flex flex-1 items-center justify-center gap-2 bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                <ArrowSquareOut className="h-4 w-4" weight="bold" />
                {t("viewPublicProfile")}
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Instagram-style portfolio grid (models) */}
      {isModel && (
        <div className="hairline-t">
          <div className="flex items-center justify-center gap-2 py-3 text-[var(--ink)]">
            <SquaresFour className="h-[18px] w-[18px]" weight="fill" />
            <span className="text-eyebrow">{t("portfolioTab")}</span>
          </div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {photos.map((photo) => (
                <Link
                  key={photo.id}
                  href={"/model/portfolio" as never}
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
                </Link>
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
        </div>
      )}

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
