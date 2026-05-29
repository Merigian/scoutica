"use client";

import { useTranslations } from "next-intl";
import { Loader2, Paperclip, Send } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "./use-auto-resize-textarea";

const MAX_LENGTH = 5000;
const COUNTER_THRESHOLD = 4500;

interface MessageComposerProps {
  onSubmit: (body: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageComposer({ onSubmit, disabled }: MessageComposerProps) {
  const t = useTranslations("components.messaging");
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useAutoResizeTextarea(value);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !sending && !disabled;

  async function handleSend() {
    if (!canSend) return;
    const body = trimmed;
    setSending(true);
    setValue("");
    try {
      await onSubmit(body);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void handleSend();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const showCounter = value.length >= COUNTER_THRESHOLD;
  const overLimit = value.length > MAX_LENGTH;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[var(--rule)] bg-[var(--bg)]"
    >
      <div className="flex items-end gap-3 px-4 py-4 lg:px-6">
        <button
          type="button"
          aria-label={t("attach")}
          disabled={disabled || sending}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            "text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]",
            "transition-colors disabled:opacity-50"
          )}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div
          className={cn(
            "relative flex-1 overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--bg-elevated)]",
            "focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]",
            "transition-all"
          )}
        >
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("composerPlaceholder")}
            rows={1}
            aria-label={t("composerPlaceholder")}
            maxLength={MAX_LENGTH + 200}
            disabled={disabled || sending}
            className={cn(
              "block w-full resize-none border-0 bg-transparent px-4 py-3.5",
              "min-h-[48px] max-h-32",
              "text-[14px] leading-[1.55] text-[var(--ink)] placeholder:text-[var(--ink-3)]",
              "focus:outline-none focus:ring-0",
              "disabled:opacity-50"
            )}
          />
          {showCounter && (
            <div
              className={cn(
                "pointer-events-none absolute right-3 top-1 text-[10px] tabular-nums",
                overLimit ? "text-[var(--accent)]" : "text-[var(--ink-3)]"
              )}
            >
              {t("counter", { current: value.length, max: MAX_LENGTH })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSend}
          aria-label={t("send")}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm transition-opacity",
            canSend
              ? "bg-[var(--accent)] text-white hover:opacity-90"
              : "bg-[var(--bg-soft)] text-[var(--ink-3)] cursor-not-allowed"
          )}
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
