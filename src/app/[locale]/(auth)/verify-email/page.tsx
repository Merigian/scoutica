"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { verifyEmail, resendVerificationEmail } from "@/server/actions/email-verification";
import { Button } from "@/components/ui/button";
import { MailCheck, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token && email ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (token && email && status === "verifying") {
      verifyEmail(token, email).then((result) => {
        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(
            result.error === "tokenExpired"
              ? t("tokenExpired")
              : result.error === "invalidToken"
                ? t("invalidToken")
                : t("error")
          );
        }
      });
    }
  }, [token, email, status, t]);

  const handleResend = async () => {
    if (!email) return;
    setResendStatus("sending");
    const result = await resendVerificationEmail(email);
    if (result.success) {
      setResendStatus("sent");
    } else {
      setResendStatus("error");
      setErrorMessage(
        result.error === "rateLimited"
          ? t("rateLimited")
          : result.error === "alreadyVerified"
            ? t("alreadyVerified")
            : t("error")
      );
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-[var(--ink-3)] mb-6" />
            <p className="text-eyebrow mb-3">{t("eyebrowVerifying")}</p>
            <h1 className="text-h2">{t("verifying")}</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] mb-6">
              <CheckCircle className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <p className="text-eyebrow mb-3">{t("eyebrowSuccess")}</p>
            <h1 className="text-h2">{t("success")}</h1>
            <p className="mt-4 text-body text-[var(--ink-2)]">{t("successDesc")}</p>
            <Button variant="default" size="lg" className="mt-8 w-full" onClick={() => router.push("/dashboard" as never)}>
              {t("continue")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center hairline border-[var(--accent)] bg-[var(--accent)]/5 mb-6">
              <AlertCircle className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <p className="text-eyebrow mb-3">{t("eyebrowError")}</p>
            <h1 className="text-h2">{t("error")}</h1>
            <p className="mt-4 text-body text-[var(--ink-2)]">{errorMessage}</p>
            {email && (
              <Button
                variant="outline"
                size="lg"
                className="mt-8 w-full"
                onClick={handleResend}
                disabled={resendStatus === "sending"}
              >
                {resendStatus === "sending" ? t("resending") : t("resend")}
              </Button>
            )}
          </>
        )}

        {status === "idle" && (
          <>
            <div className="flex h-14 w-14 items-center justify-center hairline border-[var(--rule-strong)] bg-[var(--bg-soft)] mb-6">
              <MailCheck className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <p className="text-eyebrow mb-3">{t("eyebrowInbox")}</p>
            <h1 className="text-h2">{t("title")}</h1>
            <p className="mt-4 text-body text-[var(--ink-2)]">{t("subtitle")}</p>
            <p className="mt-4 text-body text-[var(--ink-3)]">{t("checkInbox")}</p>
            {email && (
              <Button
                variant="outline"
                size="lg"
                className="mt-8 w-full"
                onClick={handleResend}
                disabled={resendStatus === "sending" || resendStatus === "sent"}
              >
                {resendStatus === "sending"
                  ? t("resending")
                  : resendStatus === "sent"
                    ? t("resent")
                    : t("resend")}
              </Button>
            )}
            {resendStatus === "error" && errorMessage && (
              <p className="mt-3 text-sm text-[var(--accent)]">{errorMessage}</p>
            )}
          </>
        )}
      </div>

      <p className="mt-10 text-center text-sm text-[var(--ink-3)]">
        <Link href="/login" className="link-underline text-[var(--ink)]">
          {t("continue")}
        </Link>
      </p>
    </>
  );
}
