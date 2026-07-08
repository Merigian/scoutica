"use client";

import { useTranslations } from "next-intl";
import { Check, Loader2, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  createGroupConversation,
  getGroupCandidates,
} from "@/server/actions/messages";
import type { OtherUserSummary } from "./types";

interface GroupCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export function GroupCreateDialog({
  open,
  onClose,
  onCreated,
}: GroupCreateDialogProps) {
  const t = useTranslations("components.messaging");

  const [candidates, setCandidates] = useState<OtherUserSummary[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Reset each time the dialog opens.
    setName("");
    setQuery("");
    setSelected(new Set());
    setError(null);
    setLoadingCandidates(true);
    let active = true;
    void getGroupCandidates().then((list) => {
      if (active) {
        setCandidates(list);
        setLoadingCandidates(false);
      }
    });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const visible = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return candidates;
    return candidates.filter((c) => c.name.toLowerCase().includes(trimmed));
  }, [candidates, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit = name.trim().length > 0 && selected.size >= 2 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const res = await createGroupConversation(name.trim(), [...selected]);
    setSubmitting(false);
    if (res.success && res.data) {
      onCreated(res.data.conversationId);
    } else {
      setError(res.error ?? t("groupCreateError"));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t("newGroupTitle")}
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative flex max-h-[85dvh] w-full flex-col bg-[var(--bg-elevated)]",
          "sm:max-w-md sm:rounded-2xl",
          "rounded-t-2xl sm:rounded-b-2xl",
          "border border-[var(--rule)]"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--rule)] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-soft)] text-[var(--ink)]">
            <Users className="h-4 w-4" />
          </span>
          <h2 className="flex-1 text-[16px] font-semibold text-[var(--ink)]">
            {t("newGroupTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--ink-2)]">
              {t("groupNameLabel")}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder={t("groupNamePlaceholder")}
              className={cn(
                "h-11 w-full rounded-xl border-0 bg-[var(--bg-soft)] px-3.5 text-[14px]",
                "placeholder:text-[var(--ink-3)] text-[var(--ink)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              )}
            />
          </label>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12px] font-medium text-[var(--ink-2)]">
                {t("selectMembers")}
              </span>
              <span className="text-[11px] tabular-nums text-[var(--ink-3)]">
                {t("membersSelected", { count: selected.size })}
              </span>
            </div>

            {candidates.length > 0 && (
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className={cn(
                    "h-11 w-full rounded-xl border-0 bg-[var(--bg-soft)] pl-10 pr-3.5 text-[14px]",
                    "placeholder:text-[var(--ink-3)] text-[var(--ink)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  )}
                />
              </div>
            )}

            {loadingCandidates ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-3)]" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="py-8 text-center text-[13px] leading-[1.5] text-[var(--ink-3)]">
                {t("noCandidates")}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {visible.map((c) => {
                  const isSel = selected.has(c.id);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => toggle(c.id)}
                        aria-pressed={isSel}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                          isSel
                            ? "bg-[var(--bg-soft)]"
                            : "hover:bg-[var(--bg-soft)]/60"
                        )}
                      >
                        <Avatar src={c.image} name={c.name} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--ink)]">
                          {c.name}
                        </span>
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            isSel
                              ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                              : "border-[var(--rule-strong)]"
                          )}
                        >
                          {isSel && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--rule)] px-5 py-4">
          {error && (
            <p className="mb-3 text-[12px] font-medium text-[var(--warning)]">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-opacity",
              "bg-[var(--accent)] text-[var(--bg)]",
              !canSubmit && "cursor-not-allowed opacity-40"
            )}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("createGroup")}
          </button>
        </div>
      </div>
    </div>
  );
}
