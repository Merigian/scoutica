import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { StudioBillingActions } from "@/components/settings/studio-billing-actions";

export default async function StudioBillingPage() {
  const session = await auth();
  const t = await getTranslations("pages.studio.billing");

  if (!session?.user?.id || session.user.role !== "STUDIO") redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });

  const currentPlan = subscription?.plan ?? "FREE";

  const features =
    currentPlan === "STUDIO"
      ? [
          "Casting illimitati",
          "Gestione candidature avanzata",
          "Ricerca talenti pro",
          "Statistiche e analytics",
        ]
      : [
          "1 casting al mese",
          "Listing pubblico studio",
          "Richieste di prenotazione",
          "Upgrade per casting illimitati",
        ];

  const planLabel = currentPlan === "STUDIO" ? "Studio Pro" : "Free";

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
          <StudioBillingActions currentPlan={currentPlan} />
        </CardContent>
      </Card>
    </div>
  );
}
