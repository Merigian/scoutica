import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { BillingActions } from "@/components/settings/billing-actions";

export default async function ScoutBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("pages.scout.billing");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect("/login");

  const [subscription, scoutProfile] = await Promise.all([
    db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
    }),
    db.scoutProfile.findUnique({
      where: { userId: session.user.id },
      select: { subtype: true },
    }),
  ]);

  const currentPlan = subscription?.plan ?? "FREE";
  const subtype = (scoutProfile?.subtype ?? "SCOUT") as "SCOUT" | "AGENCY" | "BRAND";

  const features =
    currentPlan === "AGENCY"
      ? [
          "Multi-seat workspace (3 utenti)",
          "Pubblicazione casting illimitati",
          "Ricerca avanzata e analytics",
          "Account manager dedicato",
        ]
      : currentPlan === "SCOUT_PRO"
      ? [
          "Contatti illimitati",
          "Bacheche shortlist illimitate",
          "Filtri avanzati e ricerche salvate",
          "Casting e lavori illimitati",
        ]
      : [
          "3 richieste di contatto al mese",
          "Ricerca base",
          "Salvataggio fino a 10 modelli",
          "Upgrade per funzionalità complete",
        ];

  const planLabel =
    currentPlan === "AGENCY" ? "Agency" : currentPlan === "SCOUT_PRO" ? "Scout Pro" : "Free";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{t("title")}</h1>
      </div>

      <Card className="border-[var(--accent)]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("currentPlan")}
            <Badge variant={currentPlan === "FREE" ? "outline" : "default"}>{planLabel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.currentPeriodEnd && currentPlan !== "FREE" && (
            <p className="text-xs text-[var(--ink-3)]">
              {subscription.cancelAtPeriodEnd ? "Cancellato il" : "Rinnovo il"}{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("it-IT")}
            </p>
          )}
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <BillingActions currentPlan={currentPlan} scoutSubtype={subtype} locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
