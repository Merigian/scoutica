"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { registerScoutSchema, type RegisterScoutInput } from "@/lib/validations/auth";
import { registerScout } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Turnstile, turnstileSiteKey } from "@/components/shared/turnstile";

export default function RegisterScoutPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();

  const scoutTypeOptions = [
    { value: "SCOUT", label: t("scoutLabel") },
    { value: "AGENCY", label: t("agencyLabel") },
    { value: "BRAND", label: t("brandLabel") },
  ];
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterScoutInput>({
    resolver: zodResolver(registerScoutSchema),
    defaultValues: {
      subtype: "SCOUT",
      termsAccepted: false as unknown as true,
    },
  });

  const onSubmit = async (data: RegisterScoutInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerScout({ ...data, turnstileToken } as RegisterScoutInput);

      if (!result.success) {
        setError(result.error || t("registrationError"));
        return;
      }

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
        <p className="text-eyebrow mb-5">{t("eyebrow")} · {t("roles.scout")}</p>
        <h1 className="text-h1">{t("title")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)]">{t("asScoutDesc")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="hairline border-[var(--accent)] bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--accent)]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="subtype" required>{t("scoutType")}</Label>
          <Select
            id="subtype"
            options={scoutTypeOptions}
            {...register("subtype")}
            error={errors.subtype?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" required>{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="nome@azienda.it"
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

        <Turnstile onToken={setTurnstileToken} />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={!!turnstileSiteKey && !turnstileToken}
        >
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
