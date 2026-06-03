"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import {
  verifyEmail,
  resendVerificationEmail,
  changeUnverifiedEmail,
} from "@/server/actions/email-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const initialEmail = searchParams.get("email");
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token && initialEmail ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showChange, setShowChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeStatus, setChangeStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [changeError, setChangeError] = useState<string | null>(null);

  useEffect(() => {
    if (token && initialEmail && status === "verifying") {
      verifyEmail(token, initialEmail).then((result) => {
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
  }, [token, initialEmail, status, t]);

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setChangeStatus("sending");
    setChangeError(null);
    const result = await changeUnverifiedEmail(newEmail.trim());
    if (result.success && result.data) {
      setEmail(result.data.email);
      setNewEmail("");
      setShowChange(false);
      setChangeStatus("done");
      setResendStatus(result.error === "sendFailed" ? "error" : "sent");
      if (result.error === "sendFailed") {
        setErrorMessage(t("emailChangedButSendFailed"));
      }
      router.replace(`/verify-email?email=${encodeURIComponent(result.data.email)}`);
    } else {
      setChangeStatus("error");
      setChangeError(
        result.error === "emailTaken"
          ? t("emailTaken")
          : result.error === "alreadyVerified"
            ? t("alreadyVerified")
            : result.error === "sameEmail"
              ? t("sameEmail")
              : result.error === "invalidEmail"
                ? t("invalidEmail")
                : result.error === "notAuthenticated"
                  ? t("notAuthenticated")
                  : t("error")
      );
    }
  };

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
            <Button variant="default" size="lg" className="mt-8 w-full" onClick={() => router.push("/login" as never)}>
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
            {email && !showChange && (
              <button
                type="button"
                onClick={() => setShowChange(true)}
                className="mt-4 text-sm text-[var(--ink-3)] link-underline"
              >
                {t("wrongEmail")}
              </button>
            )}
            {showChange && (
              <div className="mt-6 w-full text-left space-y-3">
                <Label htmlFor="newEmail">{t("newEmailLabel")}</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nome@esempio.com"
                  disabled={changeStatus === "sending"}
                />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={handleChangeEmail}
                    disabled={changeStatus === "sending" || !newEmail.trim()}
                    className="flex-1"
                  >
                    {changeStatus === "sending" ? t("saving") : t("saveEmail")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowChange(false);
                      setNewEmail("");
                      setChangeError(null);
                      setChangeStatus("idle");
                    }}
                    disabled={changeStatus === "sending"}
                  >
                    {t("cancel")}
                  </Button>
                </div>
                {changeError && (
                  <p className="text-sm text-[var(--accent)]">{changeError}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
