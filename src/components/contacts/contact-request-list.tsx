"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { respondToContactRequest } from "@/server/actions/contact-request";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_REASON_LABELS } from "@/config/enums";
import { formatRelativeTime } from "@/lib/utils";
import { Check, X, Clock, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

type ContactRequestItem = {
  id: string;
  subject: string;
  message: string;
  reason: string;
  status: string;
  createdAt: Date;
  respondedAt: Date | null;
  conversationId: string | null;
  scoutProfile?: {
    businessName: string | null;
    subtype: string;
    verificationStatus: string;
    user: { name: string | null; image: string | null };
  };
  modelProfile?: {
    fullName: string | null;
    slug: string;
    user: { name: string | null; image: string | null };
    portfolioImages?: { url: string }[];
  };
};

interface ContactRequestListProps {
  requests: ContactRequestItem[];
  role: "MODEL" | "SCOUT";
  locale: string;
}

const statusConfig: Record<string, { tKey: string; variant: "default" | "success" | "destructive" | "warning" }> = {
  PENDING: { tKey: "statusPending", variant: "warning" },
  ACCEPTED: { tKey: "statusAccepted", variant: "success" },
  REJECTED: { tKey: "statusRejected", variant: "destructive" },
  EXPIRED: { tKey: "statusExpired", variant: "default" },
};

export function ContactRequestList({ requests, role, locale }: ContactRequestListProps) {
  const lang = locale === "en" ? "en" : "it";

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <ContactRequestCard key={request.id} request={request} role={role} locale={locale} lang={lang} />
      ))}
    </div>
  );
}

function ContactRequestCard({
  request,
  role,
  locale,
  lang,
}: {
  request: ContactRequestItem;
  role: "MODEL" | "SCOUT";
  locale: string;
  lang: "it" | "en";
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [responding, setResponding] = useState(false);
  const t = useTranslations("components.contactRequests");

  const status = statusConfig[request.status] ?? statusConfig.PENDING;
  const reasonLabel = CONTACT_REASON_LABELS[request.reason as keyof typeof CONTACT_REASON_LABELS]?.[lang] ?? request.reason;

  const handleRespond = async (action: "accept" | "reject") => {
    setResponding(true);
    await respondToContactRequest(request.id, action);
    setResponding(false);
    router.refresh();
  };

  const personName =
    role === "MODEL"
      ? request.scoutProfile?.user?.name ?? request.scoutProfile?.businessName ?? "Scout"
      : request.modelProfile?.fullName ?? request.modelProfile?.user?.name ?? "Model";

  const personImage =
    role === "MODEL"
      ? request.scoutProfile?.user?.image
      : request.modelProfile?.portfolioImages?.[0]?.url ?? request.modelProfile?.user?.image;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={personName} src={personImage ?? undefined} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{personName}</span>
              <Badge variant={status.variant} className="text-[10px]">
                {t(status.tKey)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {reasonLabel}
              </Badge>
              <span className="text-xs text-[var(--ink-3)] ml-auto">
                {formatRelativeTime(request.createdAt)}
              </span>
            </div>

            <p className="text-sm font-medium mt-1">{request.subject}</p>

            {expanded && (
              <p className="text-sm text-[var(--ink-3)] mt-2 whitespace-pre-wrap">
                {request.message}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    {t("collapse")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    {t("readMessage")}
                  </>
                )}
              </Button>

              {role === "MODEL" && request.status === "PENDING" && (
                <>
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() => handleRespond("accept")}
                    disabled={responding}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    {t("accept")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleRespond("reject")}
                    disabled={responding}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t("decline")}
                  </Button>
                </>
              )}

              {request.status === "ACCEPTED" && request.conversationId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() =>
                    router.push(
                      `/${locale}/${role === "MODEL" ? "model" : "scout"}/messages/${request.conversationId}`
                    )
                  }
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  {t("goToChat")}
                </Button>
              )}

              {request.status === "PENDING" && role === "SCOUT" && (
                <div className="flex items-center gap-1 text-xs text-[var(--ink-3)]">
                  <Clock className="h-3.5 w-3.5" />
                  {t("waiting")}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
