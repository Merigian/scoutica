"use client";

import { useTranslations } from "next-intl";

function scorePassword(value: string): number {
  let s = 0;
  if (value.length >= 8) s++;
  if (value.length >= 12) s++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s++;
  if (/\d/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  return Math.min(s, 4);
}

const LEVELS = [
  { key: "weak", color: "var(--danger)" },
  { key: "fair", color: "var(--color-warning)" },
  { key: "good", color: "var(--ink-2)" },
  { key: "strong", color: "var(--success)" },
] as const;

export function PasswordStrength({ value }: { value: string }) {
  const t = useTranslations("auth.register.pwStrength");
  if (!value) return null;

  const level = Math.max(1, scorePassword(value));
  const current = LEVELS[level - 1];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((seg) => (
          <span
            key={seg}
            className="h-1 flex-1 transition-colors"
            style={{ backgroundColor: seg <= level ? current.color : "var(--rule)" }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs" style={{ color: current.color }}>
        {t("label")}: {t(current.key)}
      </p>
    </div>
  );
}
