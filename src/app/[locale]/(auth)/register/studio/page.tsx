"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { registerStudioSchema, type RegisterStudioInput } from "@/lib/validations/auth";
import { registerStudio } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/forms/password-strength";
import { Label } from "@/components/ui/label";
import { Turnstile, turnstileSiteKey } from "@/components/shared/turnstile";

export default function RegisterStudioPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterStudioInput>({
    resolver: zodResolver(registerStudioSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterStudioInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerStudio({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        businessName: data.businessName,
        turnstileToken,
      } as RegisterStudioInput);

      if (!result.success) {
        setError(result.error || t("registrationError"));
        return;
      }

      // Auto sign in — separate try/catch so registration error isn't masked
      try {
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
      } catch {
        // signIn failed but account was created — redirect to login
        router.push("/login" as never);
        return;
      }

      router.push("/verify-email?email=" + encodeURIComponent(data.email) as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registrationError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-eyebrow mb-5">{t("eyebrow")} · {t("roles.studio")}</p>
        <h1 className="text-h1">{t("title")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)]">{t("asStudioDesc")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="hairline border-[var(--danger)] bg-[var(--danger)]/5 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="businessName" required>{t("businessName")}</Label>
          <Input
            id="businessName"
            placeholder="Studio Milano"
            {...register("businessName")}
            error={errors.businessName?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" required>{t("firstName")}</Label>
            <Input
              id="firstName"
              placeholder="Mario"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" required>{t("lastName")}</Label>
            <Input
              id="lastName"
              placeholder="Rossi"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" required>{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholderBusiness")}
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
          <PasswordStrength value={password || ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" required>{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Turnstile onToken={setTurnstileToken} />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={!!turnstileSiteKey && !turnstileToken}
        >
          {t("submit")}
        </Button>

        <p className="text-xs text-center text-[var(--ink-3)]">
          {t("termsAgree")}{" "}
          <Link href="/terms" className="underline">{t("terms")}</Link>{" · "}
          <Link href="/privacy" className="underline">{t("privacy")}</Link>
        </p>
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
