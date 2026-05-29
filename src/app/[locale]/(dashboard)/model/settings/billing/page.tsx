import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default async function ModelBillingPage() {
  const session = await auth();
  const t = await getTranslations("pages.model.billing");

  if (!session?.user?.id || session.user.role !== "MODEL") redirect("/login");

  const features = [
    "12 foto nel portfolio",
    "Upload video e PDF book",
    "Contatti illimitati",
    "Filtri avanzati",
    "Tutto incluso gratuitamente",
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-[var(--font-display)] font-bold">{t("title")}</h1>
      </div>

      <Card className="border-[var(--accent)]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("currentPlan")}
            <Badge variant="gold">Free — Tutto incluso</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--ink-3)] mb-4">
            Tutte le funzionalità sono gratuite durante la fase di lancio.
          </p>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
