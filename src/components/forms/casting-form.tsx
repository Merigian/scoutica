"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { castingSchema, type CastingInput } from "@/lib/validations/casting";
import { createCasting, updateCasting } from "@/server/actions/castings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodboardEditor } from "@/components/moodboard/moodboard-editor";
import { ITALIAN_REGIONS } from "@/config/regions";
import { CASTING_TYPE_LABELS } from "@/config/enums";
import { AlertCircle } from "lucide-react";
import type { CastingType } from "@prisma/client";

interface CastingFormProps {
  locale: string;
  initialData?: CastingInput & { id?: string };
}

export function CastingForm({ locale, initialData }: CastingFormProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.castingForm");
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
  } = useForm<CastingInput>({
    resolver: zodResolver(castingSchema) as any,
    defaultValues: initialData ?? {
      title: "",
      description: "",
      isPaid: false,
    },
  });

  const regionOptions = ITALIAN_REGIONS.map((r) => ({
    value: r.name,
    label: r.name,
  }));

  const castingTypeOptions = (Object.keys(CASTING_TYPE_LABELS) as CastingType[]).map((key) => ({
    value: key,
    label: CASTING_TYPE_LABELS[key][lang],
  }));

  const selectedCastingType = watch("castingType");

  const onSubmit = async (data: CastingInput) => {
    setSaving(true);
    setError(null);

    const result = isEditing
      ? await updateCasting(initialData!.id!, data)
      : await createCasting(data);

    setSaving(false);

    if (result.success) {
      if (!isEditing && "data" in result && result.data) {
        router.push(`/${locale}/scout/castings`);
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
            <Label htmlFor="castingDate">{t("castingDate")}</Label>
            <Input id="castingDate" type="date" {...register("castingDate")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">{t("deadline")}</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("typeCardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("mode")}</Label>
            <Select
              options={castingTypeOptions}
              placeholder={t("select")}
              value={selectedCastingType ?? ""}
              onValueChange={(v: string) => setValue("castingType", (v || null) as any)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">{t("time")}</Label>
            <Input
              id="time"
              placeholder={t("timePlaceholder")}
              {...register("time")}
            />
          </div>

          {selectedCastingType === "PHYSICAL" && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                placeholder={t("addressPlaceholder")}
                {...register("address")}
              />
            </div>
          )}

          {selectedCastingType === "ONLINE" && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="instructions">{t("onlineInstructions")}</Label>
              <Textarea
                id="instructions"
                rows={3}
                placeholder={t("onlineInstructionsPlaceholder")}
                {...register("instructions")}
              />
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="materialsRequired">{t("materials")}</Label>
            <Textarea
              id="materialsRequired"
              rows={2}
              placeholder={t("materialsPlaceholder")}
              {...register("materialsRequired")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("requirementsCardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="requirements">{t("requirements")}</Label>
            <Textarea
              id="requirements"
              rows={3}
              placeholder={t("requirementsPlaceholder")}
              {...register("requirements")}
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

          <div className="space-y-2">
            <Label htmlFor="spots">{t("spots")}</Label>
            <Input id="spots" type="number" min={1} {...register("spots")} />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="isPaid"
              {...register("isPaid")}
              className="h-4 w-4 border-[var(--rule)] accent-[var(--ink)] focus:ring-[var(--ink)]"
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

      <Card>
        <CardHeader>
          <CardTitle>Moodboard</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodboardEditor
            value={watch("moodboard") ?? []}
            onChange={(items) => setValue("moodboard", items, { shouldDirty: true })}
          />
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
