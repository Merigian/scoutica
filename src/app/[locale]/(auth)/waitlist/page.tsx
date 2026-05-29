"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { saveWaitlistInfo } from "@/server/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

export default function WaitlistPage() {
  const t = useTranslations("auth.waitlist");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveWaitlistInfo({
      fullName: formData.get("fullName") as string,
      businessName: formData.get("businessName") as string,
      city: formData.get("city") as string,
      professionalLink: formData.get("professionalLink") as string,
      talentTypesNeeded: formData.get("talentTypesNeeded") as string,
    });

    setIsLoading(false);
    if (result.success) {
      setSaved(true);
    } else {
      setError(t("error"));
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex h-14 w-14 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] mb-6">
          <Clock className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <p className="text-eyebrow mb-3">{t("eyebrow")}</p>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)] max-w-sm">{t("subtitle")}</p>
      </div>

      {saved ? (
        <div className="bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
          {t("saved")}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-sm font-medium">{t("formTitle")}</h2>

          {error && (
            <div className="hairline border-[var(--accent)] bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--accent)]">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input id="fullName" name="fullName" placeholder="Mario Rossi" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">{t("businessName")}</Label>
            <Input id="businessName" name="businessName" placeholder="Agenzia XYZ" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" name="city" placeholder="Milano" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalLink">{t("professionalLink")}</Label>
            <Input
              id="professionalLink"
              name="professionalLink"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="talentTypesNeeded">{t("talentTypesNeeded")}</Label>
            <Input
              id="talentTypesNeeded"
              name="talentTypesNeeded"
              placeholder="Commercial, Editorial..."
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t("submit")}
          </Button>
        </form>
      )}
    </>
  );
}
