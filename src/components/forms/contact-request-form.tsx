"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { contactRequestSchema, type ContactRequestInput } from "@/lib/validations/contact";
import { sendContactRequest } from "@/server/actions/contact-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { CONTACT_REASON_LABELS } from "@/config/enums";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ContactRequestFormProps {
  modelProfileId: string;
  modelName: string;
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactRequestForm({
  modelProfileId,
  modelName,
  locale,
  open,
  onOpenChange,
}: ContactRequestFormProps) {
  const lang = locale === "en" ? "en" : "it";
  const t = useTranslations("components.contactForm");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const reasonOptions = Object.entries(CONTACT_REASON_LABELS).map(([value, labels]) => ({
    value,
    label: labels[lang],
  }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactRequestInput>({
    resolver: zodResolver(contactRequestSchema),
    defaultValues: {
      modelProfileId,
      subject: "",
      message: "",
      reason: undefined,
    },
  });

  const onSubmit = async (data: ContactRequestInput) => {
    setSending(true);
    setResult(null);
    const response = await sendContactRequest(data);
    setSending(false);
    setResult(response);
    if (response.success) {
      reset();
      setTimeout(() => onOpenChange(false), 2000);
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      title={`${t("dialogTitle")} ${modelName}`}
      description={t("dialogDesc")}
    >
        {result?.success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="font-medium text-success">
              {t("successTitle")}
            </p>
            <p className="text-sm text-[var(--ink-3)] text-center">
              {t("successMessage")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {result?.error && (
              <div className="flex items-start gap-2 rounded-md bg-[var(--accent)]/10 p-3 text-sm text-[var(--accent)]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{result.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason" required>
                {t("reason")}
              </Label>
              <Select
                options={reasonOptions}
                placeholder={t("reasonPlaceholder")}
                value={watch("reason") as string}
                onValueChange={(v: string) => setValue("reason", v as any, { shouldValidate: true })}
                error={errors.reason?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" required>
                {t("subject")}
              </Label>
              <Input
                id="subject"
                placeholder={t("subjectPlaceholder")}
                {...register("subject")}
                error={errors.subject?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" required>
                {t("message")}
              </Label>
              <Textarea
                id="message"
                rows={4}
                placeholder={t("messagePlaceholder")}
                {...register("message")}
                error={errors.message?.message}
              />
              <p className="text-xs text-[var(--ink-3)]">
                {t("messageHelp")}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("cancel")}
              </Button>
              <Button type="submit" isLoading={sending}>
                {t("submit")}
              </Button>
            </div>
          </form>
        )}
    </ResponsiveDialog>
  );
}
