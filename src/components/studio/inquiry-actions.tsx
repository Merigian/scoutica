"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus } from "@/server/actions/studios";
import { Button } from "@/components/ui/button";
import { Check, Archive } from "lucide-react";
import type { StudioInquiryStatus } from "@prisma/client";

interface InquiryActionsProps {
  inquiryId: string;
  currentStatus: StudioInquiryStatus;
}

export function InquiryActions({ inquiryId, currentStatus }: InquiryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (currentStatus === "CLOSED") return null;

  const handleAction = async (status: "REPLIED" | "CLOSED") => {
    setLoading(true);
    await updateInquiryStatus(inquiryId, status);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-1">
      {currentStatus === "PENDING" && (
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => handleAction("REPLIED")}
          disabled={loading}
          title="Segna come risposto"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        onClick={() => handleAction("CLOSED")}
        disabled={loading}
        title="Chiudi"
      >
        <Archive className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
