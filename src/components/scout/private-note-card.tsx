"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NotebookPen, Check } from "lucide-react";
import { upsertPrivateNote } from "@/server/actions/private-notes";

interface PrivateNoteCardProps {
  modelProfileId: string;
  initialContent: string;
}

export function PrivateNoteCard({
  modelProfileId,
  initialContent,
}: PrivateNoteCardProps) {
  const t = useTranslations("privateNote");
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = content.trim() !== initialContent.trim();

  const handleSave = () => {
    startTransition(async () => {
      const res = await upsertPrivateNote(modelProfileId, content);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="border border-[var(--rule)] p-4 space-y-3 bg-[var(--bg-soft)]/40">
      <div className="flex items-center gap-2 text-[var(--ink-2)]">
        <NotebookPen className="h-4 w-4" />
        <p className="text-eyebrow">{t("title")}</p>
      </div>
      <p className="text-meta text-[var(--ink-3)]">{t("description")}</p>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("placeholder")}
        rows={3}
        maxLength={2000}
        className="resize-y"
      />
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          isLoading={isPending}
          disabled={!dirty}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              {t("saved")}
            </>
          ) : (
            t("save")
          )}
        </Button>
        <span className="text-meta text-[var(--ink-3)]">{t("private")}</span>
      </div>
    </div>
  );
}
