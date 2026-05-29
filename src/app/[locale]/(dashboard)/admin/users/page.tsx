import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.admin.users");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const users = await db.user.findMany({
    include: {
      subscription: { select: { plan: true, status: true } },
      modelProfile: { select: { fullName: true, isPublished: true } },
      scoutProfile: { select: { businessName: true, verificationStatus: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const roleVariants: Record<string, "default" | "secondary" | "gold"> = {
    MODEL: "default",
    SCOUT: "secondary",
    ADMIN: "gold",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {users.length} {t("usersLatest")}
        </p>
      </div>

      <div className="divide-y divide-border  border">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-3">
            <Avatar name={user.name ?? user.email} src={user.image ?? undefined} size="sm" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {user.name ?? user.email}
                </span>
                <Badge variant={roleVariants[user.role] ?? "default"} className="text-[10px]">
                  {user.role}
                </Badge>
                {user.isSuspended && (
                  <Badge variant="destructive" className="text-[10px]">
                    {t("suspended")}
                  </Badge>
                )}
                {user.subscription?.plan !== "FREE" && (
                  <Badge variant="gold" className="text-[10px]">
                    {user.subscription?.plan}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--ink-3)] truncate">{user.email}</p>
            </div>

            <span className="text-xs text-[var(--ink-3)] shrink-0">
              {formatRelativeTime(user.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
