"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContactRequestForm } from "@/components/forms/contact-request-form";
import { Send, MessageCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface PublicProfileContactButtonProps {
  modelProfileId: string;
  modelName: string;
  locale: string;
  existingConversationId?: string | null;
  contactRequestStatus?: string | null;
  /** Button sizing/width overrides for the mobile sticky action bar. */
  size?: "default" | "lg";
  className?: string;
}

export function PublicProfileContactButton({
  modelProfileId,
  modelName,
  locale,
  existingConversationId,
  contactRequestStatus,
  size = "default",
  className,
}: PublicProfileContactButtonProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("components.profile");
  const router = useRouter();

  // Accepted: go directly to the existing chat
  if (contactRequestStatus === "ACCEPTED" && existingConversationId) {
    return (
      <Button size={size} className={className} onClick={() => router.push(`/${locale}/scout/messages?chat=${existingConversationId}`)}>
        <MessageCircle className="h-4 w-4 mr-2" />
        {t("goToChat")}
      </Button>
    );
  }

  // Pending: show disabled state
  if (contactRequestStatus === "PENDING") {
    return (
      <Button size={size} className={className} disabled variant="outline">
        <Clock className="h-4 w-4 mr-2" />
        {t("requestPending")}
      </Button>
    );
  }

  // No request yet (or rejected): show form
  return (
    <>
      <Button size={size} className={className} onClick={() => setOpen(true)}>
        <Send className="h-4 w-4 mr-2" />
        {t("contact")}
      </Button>

      <ContactRequestForm
        modelProfileId={modelProfileId}
        modelName={modelName}
        locale={locale}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
