"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { sendStudioInquiry } from "@/server/actions/studios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";

interface StudioInquiryFormProps {
  studioId: string;
  lang: "it" | "en";
}

export function StudioInquiryForm({ studioId, lang }: StudioInquiryFormProps) {
  const t = useTranslations("components.studioInquiry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDates, setPreferredDates] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(t("errorRequired"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendStudioInquiry({
        studioId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
        preferredDates: preferredDates.trim() || undefined,
        durationHours: durationHours ? parseInt(durationHours) : undefined,
      });

      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || t("errorSending"));
      }
    } catch {
      setError(t("errorSending"));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
          <h3 className="font-[var(--font-display)] font-semibold mb-1">
            {t("successTitle")}
          </h3>
          <p className="text-sm text-[var(--ink-3)]">
            {t("successMessage")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("cardTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className=" bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-2 text-xs text-[var(--accent)]">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="inq-name" className="text-xs" required>
              {t("name")}
            </Label>
            <Input
              id="inq-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inq-email" className="text-xs" required>Email</Label>
            <Input
              id="inq-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inq-phone" className="text-xs">
              {t("phone")}
            </Label>
            <Input
              id="inq-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 333 1234567"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inq-dates" className="text-xs">
                {t("dates")}
              </Label>
              <Input
                id="inq-dates"
                value={preferredDates}
                onChange={(e) => setPreferredDates(e.target.value)}
                placeholder="15-16 apr"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inq-hours" className="text-xs">
                {t("duration")}
              </Label>
              <Input
                id="inq-hours"
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="8"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inq-message" className="text-xs" required>
              {t("message")}
            </Label>
            <Textarea
              id="inq-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={3}
              className="text-sm"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
