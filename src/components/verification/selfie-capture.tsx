"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react";

type Phase = "init" | "streaming" | "captured" | "uploading" | "done";

interface SelfieCaptureProps {
  /** When present, authorizes upload via the QR "continue on phone" flow. */
  token?: string;
  /** Called once the selfie has been accepted by the server. */
  onSubmitted?: () => void;
  /** Called when no usable camera is available (desktop → show QR fallback). */
  onNoCamera?: () => void;
}

export function SelfieCapture({ token, onSubmitted, onNoCamera }: SelfieCaptureProps) {
  const t = useTranslations("verification.capture");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("init");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      onNoCamera?.();
      setError("no-camera");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("streaming");
    } catch {
      onNoCamera?.();
      setError("no-camera");
    }
  }, [onNoCamera]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror so the still matches the preview the user saw.
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
        stopStream();
        setPhase("captured");
      },
      "image/jpeg",
      0.9
    );
  }, [stopStream]);

  const retake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setPhase("init");
    startCamera();
  }, [previewUrl, startCamera]);

  const submit = useCallback(async () => {
    if (!blobRef.current) return;
    setPhase("uploading");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", blobRef.current, "selfie.jpg");
      if (token) fd.append("token", token);
      const res = await fetch("/api/verification/selfie", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || t("uploadError"));
        setPhase("captured");
        return;
      }
      setPhase("done");
      onSubmitted?.();
    } catch {
      setError(t("uploadError"));
      setPhase("captured");
    }
  }, [token, onSubmitted, t]);

  if (error === "no-camera") {
    return (
      <div className="border border-[var(--rule)] p-6 text-center space-y-3">
        <AlertCircle className="mx-auto h-6 w-6 text-[var(--ink-3)]" />
        <p className="text-body text-[var(--ink-2)]">{t("noCamera")}</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="border border-[var(--rule)] p-6 text-center space-y-3 bg-[var(--bg-soft)]/40">
        <Check className="mx-auto h-7 w-7 text-[var(--accent)]" />
        <p className="text-h3 text-[var(--ink)]">{t("doneTitle")}</p>
        <p className="text-meta text-[var(--ink-3)]">{t("doneDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden bg-black">
        {/* Live preview */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover -scale-x-100 ${
            phase === "captured" ? "hidden" : "block"
          }`}
        />
        {/* Captured still */}
        {previewUrl && phase !== "streaming" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {phase === "init" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        )}
        {/* Face guide */}
        {phase === "streaming" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-3/5 w-1/2 rounded-full border-2 border-white/50" />
          </div>
        )}
      </div>

      {error && error !== "no-camera" && (
        <p className="text-center text-meta text-red-600">{error}</p>
      )}

      <div className="flex justify-center gap-3">
        {phase === "streaming" && (
          <Button variant="default" onClick={capture}>
            <Camera className="h-4 w-4 mr-1" />
            {t("take")}
          </Button>
        )}
        {phase === "captured" && (
          <>
            <Button variant="outline" onClick={retake}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {t("retake")}
            </Button>
            <Button variant="default" onClick={submit}>
              <Check className="h-4 w-4 mr-1" />
              {t("confirm")}
            </Button>
          </>
        )}
        {phase === "uploading" && (
          <Button variant="default" disabled isLoading>
            {t("sending")}
          </Button>
        )}
      </div>

      <p className="text-center text-meta text-[var(--ink-3)]">{t("hint")}</p>
    </div>
  );
}
