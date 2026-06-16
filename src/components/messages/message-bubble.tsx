"use client";

import { cn } from "@/lib/utils";

interface DateSeparatorProps {
  label: string;
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="flex justify-center py-4"
    >
      <span className="rounded-full bg-[var(--bg-soft)] px-3 py-1 text-[11px] font-medium text-[var(--ink-3)]">
        {label}
      </span>
    </div>
  );
}

interface MessageBubbleProps {
  body: string;
  isMine: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  pending?: boolean;
  failed?: boolean;
  timeLabel?: string;
  ariaLabel?: string;
}

export function MessageBubble({
  body,
  isMine,
  isFirstInGroup,
  isLastInGroup,
  pending,
  failed,
  timeLabel,
  ariaLabel,
}: MessageBubbleProps) {
  const corners = isMine
    ? cn("rounded-2xl", isLastInGroup && "rounded-br-md")
    : cn("rounded-2xl", isLastInGroup && "rounded-bl-md");

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        isMine ? "items-end" : "items-start"
      )}
    >
      <div
        aria-label={ariaLabel}
        className={cn(
          "max-w-[min(72%,600px)] px-4 py-3",
          "text-[14px] leading-[1.55] whitespace-pre-wrap break-words",
          "shadow-sm",
          corners,
          isMine
            ? cn(
                "bg-[var(--accent)] text-[var(--bg)]",
                failed && "bg-[var(--ink)]"
              )
            : "border border-[var(--rule)] bg-[var(--bg-elevated)] text-[var(--ink)]",
          pending && "opacity-60",
          !isFirstInGroup && (isMine ? "mt-1" : "mt-1")
        )}
      >
        {body}
      </div>
      {timeLabel && (
        <span
          className={cn(
            "mt-1 text-[11px] tabular-nums text-[var(--ink-3)]",
            isMine ? "mr-1" : "ml-1"
          )}
        >
          {timeLabel}
        </span>
      )}
    </div>
  );
}
