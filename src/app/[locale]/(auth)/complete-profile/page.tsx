"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Camera, Briefcase, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { completeOAuthSetup } from "@/server/actions/auth";

const ROLES = [
  { key: "MODEL", icon: Camera },
  { key: "SCOUT", icon: Briefcase },
  { key: "STUDIO", icon: Building2 },
] as const;

export default function CompleteProfilePage() {
  const t = useTranslations("auth.register");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedRole || !termsAccepted) return;
    setLoading(true);
    setError("");
    const result = await completeOAuthSetup(selectedRole, termsAccepted);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Error");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-eyebrow mb-5">{t("completeEyebrow")}</p>
        <h1 className="text-h1">{t("completeSetup")}</h1>
        <p className="mt-4 text-body text-[var(--ink-2)]">{t("selectRole")}</p>
      </div>

      <div className="space-y-3">
        {ROLES.map(({ key, icon: Icon }) => {
          const isActive = selectedRole === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedRole(key)}
              className={`w-full flex items-center gap-4 p-4 hairline text-left transition-all ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--rule)] hover:border-[var(--rule-strong)] bg-[var(--bg)]"
              }`}
            >
              <div className={isActive ? "text-[var(--accent)]" : "text-[var(--ink-2)]"}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--ink)]">{t(`roles.${key.toLowerCase()}`)}</p>
                <p className="text-sm text-[var(--ink-3)] mt-0.5">{t(`rolesDesc.${key.toLowerCase()}`)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <label className="mt-8 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 accent-[var(--accent)]"
        />
        <span className="text-sm text-[var(--ink-3)]">
          {t("termsAgree")}{" "}
          <Link href="/terms" className="link-underline text-[var(--ink)]">
            {t("terms")}
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="link-underline text-[var(--ink)]">
            {t("privacy")}
          </Link>
        </span>
      </label>

      {error && (
        <p className="mt-4 hairline border-[var(--accent)] bg-[var(--accent)]/5 px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedRole || !termsAccepted || loading}
        className="mt-8 w-full bg-[var(--ink)] text-[var(--bg)] py-3 text-sm font-medium tracking-[0.04em] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:bg-[var(--ink-2)]"
      >
        {loading ? "…" : t("continue")}
      </button>
    </>
  );
}
