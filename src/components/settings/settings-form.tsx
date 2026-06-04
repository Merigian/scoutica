"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { CheckCircle, Camera, Loader2, Download, Trash2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { deleteAccount, exportUserData } from "@/server/actions/account";
import { compressImage } from "@/lib/compress-image";

interface SettingsFormProps {
  user: {
    name: string;
    email: string;
    locale: string;
    image: string | null;
  };
  locale: string;
}

export function SettingsForm({ user, locale }: SettingsFormProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.settingsForm");
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [userLocale, setUserLocale] = useState(user.locale);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.image);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const td = useTranslations("deleteAccount");
  const te = useTranslations("dataExport");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, locale: userLocale }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (userLocale !== locale) {
          router.push(`/${userLocale}/${locale === "it" ? "model" : "model"}/settings`);
        }
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("account")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar upload */}
          <div className="space-y-2">
            <Label>{t("profilePhoto")}</Label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar src={avatarUrl} name={name} size="xl" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const compressed = await compressImage(file, "avatar");
                      const formData = new FormData();
                      formData.append("file", compressed);
                      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.success && data.url) {
                        setAvatarUrl(data.url);
                        router.refresh();
                      }
                    } finally {
                      setUploading(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-[var(--ink-3)]">{t("photoHint")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
            <p className="text-xs text-[var(--ink-3)]">
              {t("emailReadonly")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("language")}</Label>
            <Select
              options={[
                { value: "it", label: "Italiano" },
                { value: "en", label: "English" },
              ]}
              value={userLocale}
              onValueChange={(v: string) => setUserLocale(v)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} isLoading={saving}>
              {t("save")}
            </Button>
            {saved && (
              <span className="text-sm text-success flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {t("saved")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export (L4) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {te("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--ink-3)]">{te("description")}</p>
          <Button
            variant="outline"
            isLoading={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                const result = await exportUserData();
                if (result.success && result.data) {
                  const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "scoutica-data.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }
              } finally {
                setExporting(false);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? te("preparing") : te("button")}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion (L3) */}
      <Card className="border-[var(--accent)]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--accent)]">
            <AlertTriangle className="h-4 w-4" />
            {td("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--ink-3)]">{td("warning")}</p>
          <div className="space-y-2">
            <Label>{td("confirm")}</Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={td("placeholder")}
            />
          </div>
          <Button
            variant="destructive"
            disabled={deleteConfirm !== td("placeholder") || deleting}
            isLoading={deleting}
            onClick={async () => {
              if (deleteConfirm !== td("placeholder")) return;
              setDeleting(true);
              const result = await deleteAccount();
              if (result.success) {
                await signOut({ redirect: false });
                window.location.href = "/";
              }
              setDeleting(false);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {td("button")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
