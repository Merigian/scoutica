"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SelfieCapture } from "@/components/verification/selfie-capture";
import { QrImage } from "@/components/verification/qr-image";
import { Button } from "@/components/ui/button";
import { Smartphone, Camera } from "lucide-react";
import { requestVerificationToken } from "@/server/actions/model-verification";

export function VerificationPanel() {
  const t = useTranslations("verification");
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ensureToken = useCallback(async () => {
    if (token) return;
    const res = await requestVerificationToken();
    if (res.success && res.data) setToken(res.data.token);
  }, [token]);

  const openQr = useCallback(() => {
    setShowQr(true);
    setWaiting(true);
    ensureToken();
  }, [ensureToken]);

  // Poll status while the user finishes on the phone.
  useEffect(() => {
    if (!waiting) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/verification/status", { cache: "no-store" });
        const json = await res.json();
        if (json.status === "VERIFICATION_SUBMITTED" || json.status === "APPROVED") {
          router.refresh();
        }
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [waiting, router]);

  const phoneUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/verify-selfie?token=${token}`
      : null;

  return (
    <div className="space-y-6">
      {!showQr ? (
        <>
          <SelfieCapture onSubmitted={() => router.refresh()} />

          <div className="text-center">
            <button
              type="button"
              onClick={openQr}
              className="text-meta text-[var(--ink-3)] underline underline-offset-4 hover:text-[var(--ink-2)]"
            >
              {t("qr.useInstead")}
            </button>
          </div>
        </>
      ) : (
        <div className="border border-[var(--rule)] p-6 text-center space-y-5">
          <Smartphone className="mx-auto h-6 w-6 text-[var(--ink-2)]" />
          <div className="space-y-1">
            <p className="text-h3 text-[var(--ink)]">{t("qr.title")}</p>
            <p className="text-meta text-[var(--ink-3)] max-w-sm mx-auto">{t("qr.desc")}</p>
          </div>
          <div className="flex justify-center">
            {phoneUrl ? (
              <QrImage value={phoneUrl} size={200} />
            ) : (
              <div className="h-[200px] w-[200px] bg-[var(--bg-soft)] animate-pulse" />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowQr(false)}>
              <Camera className="h-4 w-4 mr-1" />
              {t("qr.useCamera")}
            </Button>
            <Button variant="default" size="sm" onClick={() => router.refresh()}>
              {t("qr.done")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
