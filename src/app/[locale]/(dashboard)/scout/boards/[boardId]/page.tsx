import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PIPELINE_STAGE_LABELS } from "@/config/enums";
import { BoardItemActions } from "@/components/shortlists/board-item-actions";
import { Users } from "lucide-react";
import { BackLink } from "@/components/shared/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const lang = locale === "en" ? "en" : "it";
  const t = await getTranslations("pages.scout.boardDetail");
  const { boardId } = await params;

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const board = await db.shortlistBoard.findUnique({
    where: { id: boardId },
    include: {
      scoutProfile: { select: { userId: true } },
      items: {
        include: {
          modelProfile: {
            include: {
              user: { select: { name: true, image: true } },
              portfolioImages: {
                where: { isCover: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!board || board.scoutProfile.userId !== session.user.id) {
    redirect(`/${locale}/scout/boards`);
  }

  const stageVariants: Record<string, "default" | "secondary" | "warning" | "success"> = {
    SAVED: "default",
    CONTACTED: "secondary",
    REPLIED: "warning",
    SHORTLISTED: "default",
    BOOKED: "success",
  };

  // Group items by pipeline stage
  const stages = ["SAVED", "CONTACTED", "REPLIED", "SHORTLISTED", "BOOKED"];

  return (
    <PageContainer>
      <BackLink href="/scout/boards" label={t("backToBoards")} />

      <PageHeader title={board.name} description={board.description ?? undefined} />

      <div className="space-y-6">
        <p className="text-xs text-[var(--ink-3)]">
          {board.items.length} {t("profiles")}
        </p>

        {/* Pipeline stage badges */}
        <div className="flex gap-2 flex-wrap">
        {stages.map((stage) => {
          const count = board.items.filter((i) => i.pipelineStage === stage).length;
          return (
            <Badge key={stage} variant={stageVariants[stage] ?? "default"} className="text-xs">
              {PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS]?.[lang] ?? stage} ({count})
            </Badge>
          );
        })}
      </div>

      {board.items.length > 0 ? (
        <div className="space-y-3">
          {board.items.map((item) => {
            const coverImage = item.modelProfile.portfolioImages[0]?.url;
            const displayName = item.modelProfile.fullName ?? item.modelProfile.user.name ?? "Model";

            return (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      name={displayName}
                      src={coverImage ?? item.modelProfile.user.image ?? undefined}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{displayName}</span>
                        <Badge variant={stageVariants[item.pipelineStage] ?? "default"} className="text-[10px]">
                          {PIPELINE_STAGE_LABELS[item.pipelineStage as keyof typeof PIPELINE_STAGE_LABELS]?.[lang] ?? item.pipelineStage}
                        </Badge>
                      </div>

                      {item.modelProfile.city && (
                        <p className="text-xs text-[var(--ink-3)]">{item.modelProfile.city}</p>
                      )}

                      {item.note && (
                        <p className="text-xs text-[var(--ink-3)] mt-1 italic">&quot;{item.note}&quot;</p>
                      )}
                    </div>
                  </div>

                  <BoardItemActions
                    itemId={item.id}
                    boardId={boardId}
                    modelProfileId={item.modelProfileId}
                    currentStage={item.pipelineStage}
                    locale={locale}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={t("emptyBoard")}
          description={t("emptyBoardDesc")}
          actionLabel={t("discoverTalent")}
          actionHref={`/${locale}/scout/discover`}
        />
      )}
      </div>
    </PageContainer>
  );
}
