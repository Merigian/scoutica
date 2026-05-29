"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";
import { resetPassword } from "@/server/actions/auth";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword || password.length < 8) return;

    setLoading(true);
    setError("");
    const result = await resetPassword(token, email, password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error === "invalidToken" ? t("invalidToken") : result.error || "Error");
    }
    setLoading(false);
  };

  if (!token || !email) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center hairline border-[var(--accent)] bg-[var(--accent)]/5">
          <AlertCircle className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <p className="text-body text-[var(--ink-2)]">{t("invalidToken")}</p>
        <Link href="/login">
          <Button variant="outline">{t("backToLogin")}</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)]">
          <CheckCircle className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <h2 className="text-h2">{t("success")}</h2>
        <Link href="/login">
          <Button variant="default">{t("backToLogin")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <p className="text-eyebrow mb-3">{t("eyebrow")}</p>
        <h1 className="text-h1">{t("title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>{t("newPassword")}</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{t("confirmPassword")}</Label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
            error={confirmPassword.length > 0 && password !== confirmPassword ? " " : undefined}
          />
        </div>

        {error && (
          <div className="hairline border-[var(--accent)] bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--accent)]">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          disabled={!password || password !== confirmPassword || password.length < 8}
          isLoading={loading}
        >
          {t("button")}
        </Button>
      </form>
    </>
  );
}
