"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { verificationSchema, type VerificationInput } from "@/lib/validations/profile";
import { submitVerification } from "@/server/actions/scout-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import type { VerificationStatus } from "@prisma/client";

interface VerificationFormProps {
  profile: VerificationInput;
  status: VerificationStatus;
  notes: string | null;
}

export function VerificationForm({ profile, status, notes }: VerificationFormProps) {
  const router = useRouter();
  const t = useTranslations("components.verificationForm");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationInput>({
    resolver: zodResolver(verificationSchema),
    defaultValues: profile,
  });

  const onSubmit = async (data: VerificationInput) => {
    setSaving(true);
    const result = await submitVerification(data);
    setSaving(false);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    }
  };

  if (status === "APPROVED") {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="pt-6 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-success" />
          <div>
            <p className="font-medium text-success">{t("verified")}</p>
            <p className="text-sm text-[var(--ink-3)]">{t("verifiedDesc")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if ((status === "VERIFICATION_SUBMITTED" || status === "PENDING") && !success) {
    return (
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-6 flex items-center gap-3">
          <Clock className="h-6 w-6 text-warning" />
          <div>
            <p className="font-medium">{t("pendingTitle")}</p>
            <p className="text-sm text-[var(--ink-3)]">
              {t("pendingDesc")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {status === "REJECTED" && (
        <Card className="border-[var(--accent)]/30 bg-[var(--accent)]/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <XCircle className="h-6 w-6 text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--accent)]">{t("rejectedTitle")}</p>
              {notes && <p className="text-sm text-[var(--ink-3)] mt-1">{notes}</p>}
              <p className="text-sm text-[var(--ink-3)] mt-1">{t("rejectedDesc")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-success" />
            <div>
              <p className="font-medium text-success">{t("submittedTitle")}</p>
              <p className="text-sm text-[var(--ink-3)]">{t("submittedDesc")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gold" />
              {t("dataSection")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName" required>{t("fullName")}</Label>
              <Input id="fullName" placeholder="Mario Rossi" {...register("fullName")} error={errors.fullName?.message} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessName" required>{t("businessName")}</Label>
              <Input id="businessName" {...register("businessName")} error={errors.businessName?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleTitle">{t("role")}</Label>
              <Input id="roleTitle" placeholder={t("rolePlaceholder")} {...register("roleTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" required>{t("city")}</Label>
              <Input id="city" {...register("city")} error={errors.city?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professionalEmail" required>{t("professionalEmail")}</Label>
              <Input id="professionalEmail" type="email" {...register("professionalEmail")} error={errors.professionalEmail?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">{t("website")}</Label>
              <Input id="websiteUrl" placeholder="https://..." {...register("websiteUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialProfileUrl">{t("linkedin")}</Label>
              <Input id="socialProfileUrl" placeholder="https://linkedin.com/in/..." {...register("socialProfileUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber">{t("vatNumber")}</Label>
              <Input id="vatNumber" placeholder={t("vatPlaceholder")} {...register("vatNumber")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="purposeOfUse">{t("purposeOfUse")}</Label>
              <textarea
                id="purposeOfUse"
                className="flex min-h-[80px] w-full  border border-[var(--rule)] bg-[var(--bg)] px-3 py-2 text-sm placeholder:text-[var(--ink-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={t("purposeOfUsePlaceholder")}
                {...register("purposeOfUse")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{t("italyOnly")}</Badge>
          <span className="text-xs text-[var(--ink-3)]">{t("italyOnlyDesc")}</span>
        </div>

        <Button type="submit" isLoading={saving}>
          {status === "REJECTED" ? t("resubmit") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
