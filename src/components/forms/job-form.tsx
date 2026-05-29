"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { jobSchema, type JobInput } from "@/lib/validations/job";
import { createJob, updateJob } from "@/server/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITALIAN_REGIONS } from "@/config/regions";
import { JOB_TYPE_LABELS } from "@/config/enums";
import { AlertCircle } from "lucide-react";
import type { JobType } from "@prisma/client";

interface JobFormProps {
  locale: string;
  initialData?: JobInput & { id?: string };
}

export function JobForm({ locale, initialData }: JobFormProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.jobForm");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema) as any,
    defaultValues: initialData ?? {
      title: "",
      description: "",
      jobType: "SHOOTING",
      isPaid: false,
    },
  });

  const regionOptions = ITALIAN_REGIONS.map((r) => ({
    value: r.name,
    label: r.name,
  }));

  const jobTypeOptions = (Object.keys(JOB_TYPE_LABELS) as JobType[]).map((key) => ({
    value: key,
    label: JOB_TYPE_LABELS[key][lang],
  }));

  const onSubmit = async (data: JobInput) => {
    setSaving(true);
    setError(null);

    const result = isEditing
      ? await updateJob(initialData!.id!, data)
      : await createJob(data);

    setSaving(false);

    if (result.success) {
      if (!isEditing && "data" in result && result.data) {
        router.push(`/${locale}/scout/lavori`);
      } else {
        router.refresh();
      }
    } else {
      setError(result.error ?? t("unknownError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-[var(--accent)]/10 p-3 text-sm text-[var(--accent)]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title" required>{t("title")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
              error={errors.title?.message}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description" required>{t("description")}</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder={t("descPlaceholder")}
              {...register("description")}
              error={errors.description?.message}
            />
          </div>

          <div className="space-y-2">
            <Label required>{t("jobType")}</Label>
            <Select
              options={jobTypeOptions}
              placeholder={t("select")}
              value={watch("jobType") ?? ""}
              onValueChange={(v: string) => setValue("jobType", v as any)}
            />
            {errors.jobType && (
              <p className="text-xs text-[var(--accent)]">{errors.jobType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Input id="brand" {...register("brand")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" {...register("city")} />
          </div>

          <div className="space-y-2">
            <Label>{t("region")}</Label>
            <Select
              options={regionOptions}
              placeholder={t("select")}
              value={watch("region") ?? ""}
              onValueChange={(v: string) => setValue("region", v || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t("location")}</Label>
            <Input
              id="location"
              placeholder={t("locationPlaceholder")}
              {...register("location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDates">{t("jobDates")}</Label>
            <Input
              id="jobDates"
              placeholder={t("jobDatesPlaceholder")}
              {...register("jobDates")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">{t("deadline")}</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spotsNeeded">{t("spots")}</Label>
            <Input id="spotsNeeded" type="number" min={1} {...register("spotsNeeded")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("requirementsCardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="modelRequirements">{t("requirements")}</Label>
            <Textarea
              id="modelRequirements"
              rows={3}
              placeholder={t("requirementsPlaceholder")}
              {...register("modelRequirements")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensation">{t("compensation")}</Label>
            <Input
              id="compensation"
              placeholder={t("compensationPlaceholder")}
              {...register("compensation")}
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isPaid"
              {...register("isPaid")}
              className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
            />
            <Label htmlFor="isPaid" className="cursor-pointer">
              {t("paidJob")}
            </Label>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
        <Button type="submit" isLoading={saving}>
          {isEditing ? t("saveChanges") : t("create")}
        </Button>
      </div>
    </form>
  );
}
