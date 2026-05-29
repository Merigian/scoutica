"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { scoutProfileSchema, type ScoutProfileInput } from "@/lib/validations/profile";
import { updateScoutProfile } from "@/server/actions/scout-profile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface ScoutProfileFormProps {
  profile: {
    businessName: string | null;
    roleTitle: string | null;
    bio: string | null;
    city: string | null;
    professionalEmail: string | null;
    websiteUrl: string | null;
    socialProfileUrl: string | null;
    vatNumber: string | null;
  };
}

export function ScoutProfileForm({ profile }: ScoutProfileFormProps) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ScoutProfileInput>({
    resolver: zodResolver(scoutProfileSchema) as any,
    defaultValues: {
      businessName: profile.businessName ?? "",
      roleTitle: profile.roleTitle ?? "",
      bio: profile.bio ?? "",
      city: profile.city ?? "",
      professionalEmail: profile.professionalEmail ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      socialProfileUrl: profile.socialProfileUrl ?? "",
      vatNumber: profile.vatNumber ?? "",
    },
  });

  const doSave = useCallback(
    async (data: ScoutProfileInput) => {
      setSaveStatus("saving");
      const result = await updateScoutProfile(data);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end h-6">
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--ink-3)]">
            <Loader2 className="h-3 w-3 animate-spin" /> Salvataggio...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <Check className="h-3 w-3" /> Salvato
          </span>
        )}
        {saveStatus === "error" && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--accent)]">
            <AlertCircle className="h-3 w-3" /> Errore nel salvataggio
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Informazioni attività</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName" required>Nome attività</Label>
            <Input id="businessName" placeholder="Es. Koci Agency" {...register("businessName")} error={errors.businessName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Ruolo</Label>
            <Input id="roleTitle" placeholder="Es. Direttore Casting" {...register("roleTitle")} error={errors.roleTitle?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Città</Label>
            <Input id="city" placeholder="Es. Milano" {...register("city")} error={errors.city?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">Partita IVA</Label>
            <Input id="vatNumber" placeholder="Es. IT12345678901" {...register("vatNumber")} error={errors.vatNumber?.message} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Descrivi la tua attività..." rows={4} {...register("bio")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contatti</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="professionalEmail">Email professionale</Label>
            <Input id="professionalEmail" type="email" placeholder="Es. info@agenzia.it" {...register("professionalEmail")} error={errors.professionalEmail?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Sito web</Label>
            <Input id="websiteUrl" type="url" placeholder="https://www.esempio.it" {...register("websiteUrl")} error={errors.websiteUrl?.message} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="socialProfileUrl">Profilo social</Label>
            <Input id="socialProfileUrl" type="url" placeholder="https://instagram.com/..." {...register("socialProfileUrl")} error={errors.socialProfileUrl?.message} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
