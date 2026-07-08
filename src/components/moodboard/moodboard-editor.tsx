"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FileText, Link as LinkIcon, X, Loader2, Upload } from "lucide-react";
import { uploadFileWithProgress } from "@/lib/upload-with-progress";
import type { MoodboardItem } from "@/lib/validations/moodboard";

interface MoodboardEditorProps {
  value: MoodboardItem[];
  onChange: (items: MoodboardItem[]) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX = 30;

type UploadResponse = { success: boolean; item?: MoodboardItem; error?: string };

export function MoodboardEditor({ value, onChange }: MoodboardEditorProps) {
  const t = useTranslations("components.moodboard");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const remaining = MAX - value.length;
    const chosen = Array.from(files).slice(0, Math.max(0, remaining));
    if (chosen.length === 0) {
      setError(t("maxReached", { max: MAX }));
      return;
    }
    setUploading(true);
    const added: MoodboardItem[] = [];
    for (const file of chosen) {
      try {
        const res = (await uploadFileWithProgress(
          "/api/moodboard/upload",
          file,
          () => {}
        )) as UploadResponse;
        if (res.success && res.item) added.push(res.item);
        else setError(res.error ?? t("uploadError"));
      } catch {
        setError(t("uploadError"));
      }
    }
    if (added.length) onChange([...value, ...added]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError(t("invalidLink"));
      return;
    }
    if (value.length >= MAX) {
      setError(t("maxReached", { max: MAX }));
      return;
    }
    setError(null);
    onChange([...value, { kind: "LINK", url, name: url }]);
    setLinkUrl("");
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((item, i) => (
            <li
              key={`${item.url}-${i}`}
              className="relative aspect-square overflow-hidden hairline bg-[var(--bg-soft)]"
            >
              {item.kind === "IMAGE" ? (
                <Image
                  src={item.url}
                  alt={item.name ?? "Moodboard"}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                  {item.kind === "FILE" ? (
                    <FileText className="h-6 w-6 text-[var(--ink-3)]" />
                  ) : (
                    <LinkIcon className="h-6 w-6 text-[var(--ink-3)]" />
                  )}
                  <span className="line-clamp-2 break-all text-[10px] text-[var(--ink-3)]">
                    {item.name ?? item.url}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={t("remove")}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/55 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || value.length >= MAX}
          className="inline-flex min-h-[44px] items-center gap-2 hairline px-3 py-2 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {t("addFiles")}
        </button>
        <span className="text-xs text-[var(--ink-3)]">
          {value.length}/{MAX}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLink();
            }
          }}
          placeholder={t("linkPlaceholder")}
          className="min-h-[44px] min-w-[12rem] flex-1 hairline bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
        />
        <button
          type="button"
          onClick={addLink}
          className="inline-flex min-h-[44px] items-center gap-2 hairline px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-soft)]"
        >
          <LinkIcon className="h-4 w-4" /> {t("addLink")}
        </button>
      </div>

      <p className="text-xs text-[var(--ink-3)]">{t("hint")}</p>
      {error && <p className="text-xs text-[var(--warning)]">{error}</p>}
    </div>
  );
}
