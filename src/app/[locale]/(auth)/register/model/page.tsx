"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { registerModelSchema, type RegisterModelInput } from "@/lib/validations/auth";
import { registerModel } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export default function RegisterModelPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterModelInput>({
    resolver: zodResolver(registerModelSchema),
    defaultValues: {
      ageConfirmation: false as unknown as true,
      termsAccepted: false as unknown as true,
    },
  });

  // Client-side age check from dateOfBirth
  const dateOfBirth = watch("dateOfBirth");
  const isUnderage = (() => {
    if (!dateOfBirth) return false;
    const birth = new Date(dateOfBirth);
    if (isNaN(birth.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age < 18;
  })();

  const onSubmit = async (data: RegisterModelInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerModel(data);

      if (!result.success) {
        setError(result.error || t("registrationError"));
        return;
      }

      // Auto sign in after registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push("/verify-email?email=" + encodeURIComponent(data.email) as never);
    } catch {
      setError(t("registrationError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-eyebrow mb-5">{t("eyebrow")} · {t("roles.model")}</p>
        <h1 className="text-h1">{t("title")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)]">{t("asModelDesc")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="hairline border-[var(--accent)] bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--accent)]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" required>{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="nome@esempio.it"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" required>{t("password")}</Label>
          <PasswordInput
            id="password"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" required>{t("dateOfBirth")}</Label>
          <Input
            id="dateOfBirth"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            {...register("dateOfBirth")}
            error={errors.dateOfBirth?.message}
          />
          {isUnderage && (
            <p className="text-sm text-[var(--accent)]">{t("underageError")}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="ageConfirmation"
              className="mt-1 h-4 w-4 rounded border-[var(--rule)]"
              {...register("ageConfirmation")}
            />
            <Label htmlFor="ageConfirmation" className="text-sm font-normal leading-snug">
              {t("ageConfirmation")}
            </Label>
          </div>
          {errors.ageConfirmation && (
            <p className="text-sm text-[var(--accent)]">{t("ageConfirmRequired")}</p>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="termsAccepted"
              className="mt-1 h-4 w-4 rounded border-[var(--rule)]"
              {...register("termsAccepted")}
            />
            <Label htmlFor="termsAccepted" className="text-sm font-normal leading-snug">
              {t("termsAccept")}
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-[var(--accent)]">{t("termsRequired")}</p>
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isUnderage}>
          {t("submit")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--ink-3)]">
        {t("hasAccount")}{" "}
        <Link href="/login" className="link-underline text-[var(--ink)]">
          {t("login")}
        </Link>
      </p>
    </>
  );
}
