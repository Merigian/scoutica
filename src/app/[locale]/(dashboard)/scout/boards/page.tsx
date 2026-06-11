import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateBoardDialog } from "@/components/shortlists/create-board-dialog";
import { Layers, Users } from "lucide-react";

export default async function ScoutBoardsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("pages.scout.boards");

  if (!session?.user?.id || session.user.role !== "SCOUT") redirect(`/${locale}/login`);

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!scoutProfile) redirect(`/${locale}/scout/profile`);

  const boards = await db.shortlistBoard.findMany({
    where: { scoutProfileId: scoutProfile.id },
    include: {
      _count: { select: { items: true } },
      items: {
        take: 4,
        include: {
          modelProfile: {
            select: {
              fullName: true,
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
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[var(--font-display)] font-bold">
            {t("title")}
          </h1>
          <p className="text-[var(--ink-3)] text-sm mt-1">
            {t("description")}
          </p>
        </div>
        <CreateBoardDialog locale={locale} />
      </div>

      {boards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/${locale}/scout/boards/${board.id}`}>
              <Card className="hover:border-[var(--accent)]/30 transition-colors h-full">
                <CardContent className="p-4">
                  {/* Mini avatar grid */}
                  <div className="flex -space-x-2 mb-3">
                    {board.items.slice(0, 4).map((item, i) => {
                      const img = item.modelProfile.portfolioImages[0]?.url;
                      return (
                        <div
                          key={item.id}
                          className="h-8 w-8 rounded-full border-2 border-background bg-[var(--bg-soft)] overflow-hidden"
                          style={{ zIndex: 4 - i }}
                        >
                          {img ? (
                            <img src={img} alt={item.modelProfile.fullName ?? ""} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-[var(--ink-3)]">
                              {item.modelProfile.fullName?.[0] ?? "?"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {board._count.items > 4 && (
                      <div className="h-8 w-8 rounded-full border-2 border-background bg-[var(--bg-soft)] flex items-center justify-center text-[10px] text-[var(--ink-3)]">
                        +{board._count.items - 4}
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium text-sm">{board.name}</h3>
                  {board.description && (
                    <p className="text-xs text-[var(--ink-3)] mt-0.5 line-clamp-1">{board.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-[var(--ink-3)]">
                    <Users className="h-3 w-3" />
                    {board._count.items} {t("profiles")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title={t("noBoards")}
          description={t("noBoardsDesc")}
        />
      )}
    </div>
  );
}
