"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBoard } from "@/server/actions/shortlists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateBoardDialogProps {
  locale: string;
}

export function CreateBoardDialog({ locale }: CreateBoardDialogProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.createBoard");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    const result = await createBoard(name.trim(), description.trim() || undefined);
    setCreating(false);
    if (result.success) {
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
    } else {
      setError(result.error ?? t("error"));
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        {t("newBoard")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("createBoard")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-[var(--accent)]/10 p-3 text-sm text-[var(--accent)]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label required>{t("name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descPlaceholder")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleCreate} isLoading={creating} disabled={!name.trim()}>
                {t("create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
