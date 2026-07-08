"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { modelProfileSchema, type ModelProfileInput } from "@/lib/validations/profile";
import { updateModelProfile } from "@/server/actions/model-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GENDER_LABELS, EYE_COLOR_LABELS, HAIR_COLOR_LABELS, ETHNICITY_LABELS, MODEL_CATEGORY_LABELS, PROFESSIONAL_STATUS_LABELS, PROFILE_VISIBILITY_LABELS } from "@/config/enums";
import { ALL_REGION_NAMES } from "@/config/regions";

interface ModelProfileFormProps {
  profile: Omit<ModelProfileInput, 'firstName' | 'lastName'> & { firstName: string; lastName: string; dateOfBirth: string | null };
}

export function ModelProfileForm({ profile }: ModelProfileFormProps) {
  const router = useRouter();
  const t = useTranslations("model.profile");
  const tp = useTranslations("components.profileForm");
  const locale = useLocale();
  const lang = (locale === "en" ? "en" : "it") as "it" | "en";
  const dobLocked = Boolean(profile.dateOfBirth);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModelProfileInput>({
    resolver: zodResolver(modelProfileSchema) as any,
    defaultValues: {
      ...profile,
      dateOfBirth: profile.dateOfBirth ?? undefined,
    },
  });

  // Auto-save on form changes (debounced)
  const doSave = useCallback(
    async (data: ModelProfileInput) => {
      setSaveStatus("saving");
      const result = await updateModelProfile(data);
      if (result.success) {
        setSaveStatus("saved");
        router.refresh();
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [router]
  );

  const formValues = watch();

  useEffect(() => {
    // Skip auto-save on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSubmit(doSave)();
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formValues)]);

  const enumToOptions = (labels: Record<string, { it: string; en: string }>) =>
    Object.entries(labels).map(([value, l]) => ({ value, label: l[lang] }));

  const selectPlaceholder = tp("select");

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("sections.personal")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" required>{tp("firstName")}</Label>
            <Input id="firstName" {...register("firstName")} error={errors.firstName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" required>{tp("lastName")}</Label>
            <Input id="lastName" {...register("lastName")} error={errors.lastName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" required>{t("fields.dateOfBirth")}</Label>
            <Input id="dateOfBirth" type="date" disabled={dobLocked} {...register("dateOfBirth")} error={errors.dateOfBirth?.message} />
            {dobLocked && (
              <p className="text-xs text-[var(--ink-3)]">{t("fields.dateOfBirthLocked")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" required>{t("fields.gender")}</Label>
            <Select id="gender" options={enumToOptions(GENDER_LABELS)} placeholder={selectPlaceholder} {...register("gender")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region" required>{t("fields.region")}</Label>
            <Select id="region" options={ALL_REGION_NAMES.map((r) => ({ value: r, label: r }))} placeholder={selectPlaceholder} {...register("region")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" required>{t("fields.city")}</Label>
            <Controller
              control={control}
              name="city"
              render={({ field, fieldState }) => (
                <AddressAutocomplete
                  id="city"
                  mode="city"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onSelect={(r) => {
                    field.onChange(r.city || r.text);
                    if (r.region && ALL_REGION_NAMES.includes(r.region)) {
                      setValue("region", r.region, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">{t("fields.bio")}</Label>
            <Textarea id="bio" rows={4} placeholder={tp("bioPlaceholder")} {...register("bio")} />
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("sections.measurements")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="height" required>{t("fields.height")}</Label>
            <Input id="height" type="number" placeholder="175" {...register("height")} error={errors.height?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bust">{t("fields.bust")}</Label>
            <Input id="bust" type="number" placeholder="85" {...register("bust")} error={errors.bust?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">{t("fields.waist")}</Label>
            <Input id="waist" type="number" placeholder="62" {...register("waist")} error={errors.waist?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hips">{t("fields.hips")}</Label>
            <Input id="hips" type="number" placeholder="90" {...register("hips")} error={errors.hips?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoeSize">{t("fields.shoeSize")}</Label>
            <Input id="shoeSize" type="number" step="0.5" placeholder="39" {...register("shoeSize")} error={errors.shoeSize?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dressSize">{t("fields.dressSize")}</Label>
            <Input id="dressSize" placeholder="40 / S" {...register("dressSize")} error={errors.dressSize?.message} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("sections.appearance")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="eyeColor">{t("fields.eyeColor")}</Label>
            <Select id="eyeColor" options={enumToOptions(EYE_COLOR_LABELS)} placeholder={selectPlaceholder} {...register("eyeColor")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hairColor">{t("fields.hairColor")}</Label>
            <Select id="hairColor" options={enumToOptions(HAIR_COLOR_LABELS)} placeholder={selectPlaceholder} {...register("hairColor")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ethnicity">{t("fields.ethnicity")}</Label>
            <Select id="ethnicity" options={enumToOptions(ETHNICITY_LABELS)} placeholder={selectPlaceholder} {...register("ethnicity")} />
          </div>
        </CardContent>
      </Card>

      {/* Professional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("sections.professional")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="professionalStatus">{t("fields.professionalStatus")}</Label>
            <Select id="professionalStatus" options={enumToOptions(PROFESSIONAL_STATUS_LABELS)} placeholder={selectPlaceholder} {...register("professionalStatus")} />
          </div>
          <div className="space-y-2">
            <Label required>{t("fields.categories")}</Label>
            <MultiSelect
              options={enumToOptions(MODEL_CATEGORY_LABELS)}
              selected={watch("categories") || []}
              onChange={(values) => setValue("categories", values as any)}
              placeholder={tp("categoriesPlaceholder")}
            />
            <p className="text-xs text-[var(--ink-3)]">
              {tp("categoriesHelp")}
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="travelAvailability" className="h-4 w-4 border-[var(--rule)] accent-[var(--ink)]" {...register("travelAvailability")} />
            <Label htmlFor="travelAvailability">{t("fields.travelAvailability")}</Label>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("sections.social")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">{t("fields.instagram")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--ink-3)]">@</span>
              <Input id="instagramUrl" className="pl-8" placeholder={tp("igPlaceholder")} {...register("instagramUrl")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">{t("fields.tiktok")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--ink-3)]">@</span>
              <Input id="tiktokUrl" className="pl-8" placeholder={tp("tiktokPlaceholder")} {...register("tiktokUrl")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">{t("fields.website")}</Label>
            <Input id="websiteUrl" placeholder="https://..." {...register("websiteUrl")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="followerCount">{t("fields.followerCount")}</Label>
            <Input id="followerCount" type="number" placeholder="10000" {...register("followerCount")} />
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("sections.visibility")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="visibility">{t("fields.visibility")}</Label>
            <Select id="visibility" options={enumToOptions(PROFILE_VISIBILITY_LABELS)} {...register("visibility")} />
          </div>
        </CardContent>
      </Card>

      {/* Auto-save status */}
      <div className="flex items-center gap-2 text-sm text-[var(--ink-3)] h-6">
        {saveStatus === "saving" && (
          <span className="animate-pulse">{tp("saving")}</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-success animate-fade-in">{tp("saved")}</span>
        )}
        {saveStatus === "error" && (
          <span className="text-[var(--accent)] animate-fade-in">{tp("error")}</span>
        )}
      </div>
    </div>
  );
}
