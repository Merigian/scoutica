"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/server/actions/auth";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await requestPasswordReset(email.trim());
      if (result.success) {
        setStatus("sent");
      } else {
        setErrorMsg(result.error || "");
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <>
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)]">
            <CheckCircle2 className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <p className="text-eyebrow mb-3">{t("forgotPassword.eyebrowSent")}</p>
          <h1 className="text-h2">{t("forgotPassword.sentTitle")}</h1>
          <p className="mt-4 text-body text-[var(--ink-2)]">
            {t("forgotPassword.sentDescription", { email })}
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)]">
          <Mail className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <p className="text-eyebrow mb-3">{t("forgotPassword.eyebrowReset")}</p>
        <h1 className="text-h1">{t("login.forgotPassword")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)]">
          {t("forgotPassword.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("forgotPassword.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {status === "error" && (
          <div className="hairline border-[var(--accent)] bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--accent)] animate-fade-in">
            {errorMsg || t("forgotPassword.genericError")}
          </div>
        )}
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          isLoading={status === "loading"}
        >
          {status === "loading" ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
        </Button>
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </form>
    </>
  );
}
