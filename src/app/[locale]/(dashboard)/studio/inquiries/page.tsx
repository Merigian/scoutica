import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getMyInquiries } from "@/server/queries/studios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, Mail, Phone, Calendar, Clock } from "lucide-react";
import { STUDIO_INQUIRY_STATUS_LABELS } from "@/config/enums";
import { InquiryActions } from "@/components/studio/inquiry-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function InquiriesPage() {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.studio.inquiries");

  if (!session?.user || session.user.role !== "STUDIO") {
    redirect(`/${locale}/login`);
  }

  const inquiries = await getMyInquiries(session.user.id);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("noInquiries")}
          description={t("noInquiriesDesc")}
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{inquiry.name}</h3>
                    <p className="text-xs text-[var(--ink-3)]">
                      Per: <span className="font-medium">{inquiry.studio.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={inquiry.status === "PENDING" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {STUDIO_INQUIRY_STATUS_LABELS[inquiry.status][lang]}
                    </Badge>
                    <InquiryActions inquiryId={inquiry.id} currentStatus={inquiry.status} />
                  </div>
                </div>

                <p className="text-sm mb-3 whitespace-pre-wrap">{inquiry.message}</p>

                <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-3)]">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                  </span>
                  {inquiry.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                    </span>
                  )}
                  {inquiry.preferredDates && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {inquiry.preferredDates}
                    </span>
                  )}
                  {inquiry.durationHours && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {inquiry.durationHours}h
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-[var(--ink-3)] mt-3">
                  {new Date(inquiry.createdAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
