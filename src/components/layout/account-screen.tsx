"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Avatar } from "@/components/ui/avatar";
import {
  Images,
  ShieldCheck,
  Buildings,
  CaretRight,
  PencilSimple,
  ArrowSquareOut,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

type Role = "model" | "scout" | "studio" | "admin";

type Row = { key: string; href: string; icon: PhosphorIcon };

/** Profile-defining links only (identity-related). Everything else lives in the burger menu. */
function rowsForRole(role: Role): Row[] {
  switch (role) {
    case "model":
      return [
        { key: "portfolio", href: "/model/portfolio", icon: Images },
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
}

export function AccountScreen({ publicHref }: AccountScreenProps) {
  const { data: session } = useSession();
  const t = useTranslations("account");
  const tNav = useTranslations("nav");

  if (!session?.user) return null;

  const role = session.user.role.toLowerCase() as Role;
  const rows = rowsForRole(role);
  const editHref = EDIT_HREF[role];
  const hasCta = Boolean(editHref || publicHref);

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
