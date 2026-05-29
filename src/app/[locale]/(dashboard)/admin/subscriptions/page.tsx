import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.admin.subscriptions");

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect(`/${locale}/login`);

  const subscriptions = await db.subscription.findMany({
    where: { plan: { not: "FREE" } },
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive"> = {
    ACTIVE: "success",
    TRIALING: "default",
    PAST_DUE: "warning",
    CANCELED: "destructive",
    INCOMPLETE: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">
          {t("title")}
        </h1>
        <p className="text-[var(--ink-3)] text-sm mt-1">
          {subscriptions.length} {t("activeSubscriptions")}
        </p>
      </div>

      {subscriptions.length > 0 ? (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{sub.user.name ?? sub.user.email}</span>
                      <Badge variant="outline" className="text-[10px]">{sub.plan}</Badge>
                      <Badge variant={statusVariants[sub.status] ?? "default"} className="text-[10px]">
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--ink-3)]">{sub.user.email}</p>
                    <p className="text-xs text-[var(--ink-3)]">
                      {formatRelativeTime(sub.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title={t("noSubscriptions")}
          description={t("noSubscriptionsDesc")}
        />
      )}
    </div>
  );
}
