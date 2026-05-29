"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { ArrowLeft, BadgeCheck, Info, MessageSquare } from "lucide-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  deleteConversation,
  getConversationMessages,
  getModelProfileForChat,
  getScoutProfileForChat,
  getStudioProfileForChat,
  markConversationRead,
} from "@/server/actions/messages";
import { ConversationActionsMenu } from "./conversation-actions-menu";
import { ConversationSidebar } from "./conversation-sidebar";
import { MessageThreadView } from "./message-thread-view";
import {
  ProfilePanel,
  type ChatModelProfile,
  type ChatScoutProfile,
  type ChatStudioProfile,
  type ProfilePanelData,
} from "./profile-panel";
import { useConversationPrefs } from "./use-conversation-prefs";
import type {
  ConversationSummary,
  MessageRow,
  OtherUserSummary,
  ViewerRole,
} from "./types";

interface MessagingShellProps {
  viewerRole: ViewerRole;
  currentUserId: string;
  conversations: ConversationSummary[];
  initialConversationId?: string | null;
}

type ThreadState = {
  conversationId: string;
  messages: MessageRow[];
  hasMore: boolean;
  nextCursor: string | null;
  otherUser: OtherUserSummary;
  otherLastReadAt: Date | string | null;
};

type View = "list" | "thread" | "profile";

export function MessagingShell({
  viewerRole,
  currentUserId,
  conversations: initialConversations,
  initialConversationId,
}: MessagingShellProps) {
  const t = useTranslations("components.messaging");
  const router = useRouter();
  const pathname = usePathname();
  const prefs = useConversationPrefs();

  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [thread, setThread] = useState<ThreadState | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [view, setView] = useState<View>(
    initialConversationId ? "thread" : "list"
  );
  const [profileData, setProfileData] = useState<ProfilePanelData>({
    kind: "none",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const loadThread = useCallback(
    async (id: string) => {
      setLoadingThread(true);
      const payload = await getConversationMessages(id);
      if (payload) {
        setThread({
          conversationId: id,
          messages: payload.messages,
          hasMore: payload.hasMore,
          nextCursor: payload.nextCursor,
          otherUser: payload.otherUser,
          otherLastReadAt: payload.otherLastReadAt,
        });
      } else {
        setThread(null);
      }
      setLoadingThread(false);
    },
    []
  );

  useEffect(() => {
    if (!activeId) {
      setThread(null);
      setProfileData({ kind: "none" });
      return;
    }
    void loadThread(activeId);
  }, [activeId, loadThread]);

  const loadProfile = useCallback(
    async (other: OtherUserSummary) => {
      setProfileLoading(true);
      try {
        if (other.role === "MODEL") {
          const p = await getModelProfileForChat(other.id);
          setProfileData({ kind: "model", profile: p as ChatModelProfile | null });
        } else if (other.role === "STUDIO") {
          const p = await getStudioProfileForChat(other.id);
          setProfileData({ kind: "studio", profile: p as ChatStudioProfile | null });
        } else if (other.role === "SCOUT") {
          const p = await getScoutProfileForChat(other.id);
          setProfileData({ kind: "scout", profile: p as ChatScoutProfile | null });
        } else {
          setProfileData({ kind: "none" });
        }
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!thread) return;
    void loadProfile(thread.otherUser);
  }, [thread, loadProfile]);

  const handleSelect = useCallback(
    (id: string) => {
      setActiveId(id);
      setView("thread");
      const params = new URLSearchParams();
      params.set("chat", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleBack = useCallback(() => {
    setView("list");
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const handleMessageSent = useCallback(
    (preview: { body: string; createdAt: Date }) => {
      if (!activeId) return;
      startTransition(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: {
                    body: preview.body,
                    senderId: currentUserId,
                    createdAt: preview.createdAt,
                  },
                  hasUnread: false,
                  messageCount: c.messageCount + 1,
                }
              : c
          )
        );
      });
    },
    [activeId, currentUserId]
  );

  const handleDelete = useCallback(async () => {
    if (!activeId) return;
    const id = activeId;
    setActiveId(null);
    setThread(null);
    setView("list");
    setConversations((prev) => prev.filter((c) => c.id !== id));
    router.replace(pathname, { scroll: false });
    await deleteConversation(id);
    router.refresh();
  }, [activeId, pathname, router]);

  useEffect(() => {
    if (!activeId) return;
    void markConversationRead(activeId);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, hasUnread: false } : c))
    );
  }, [activeId]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const heightClass =
    "h-[calc(100dvh-4rem-2rem-env(safe-area-inset-bottom))] lg:h-[calc(100dvh-4rem-3rem)]";

  return (
    <div
      className={cn(
        "-mx-4 -mb-20 lg:-mx-6 lg:-mb-6 -mt-4 lg:-mt-6 hairline-t",
        heightClass
      )}
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
        {/* SIDEBAR */}
        <div
          className={cn(
            "min-h-0 hairline-r",
            view === "list" ? "flex" : "hidden lg:flex",
            "flex-col"
          )}
        >
          <ConversationSidebar
            viewerRole={viewerRole}
            currentUserId={currentUserId}
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </div>

        {/* THREAD */}
        <div
          className={cn(
            "min-h-0 hairline-r",
            view === "thread" ? "flex" : "hidden lg:flex",
            "flex-col"
          )}
        >
          {!activeId || !activeConversation ? (
            <EmptyThread t={t} />
          ) : loadingThread || !thread ? (
            <ThreadSkeleton />
          ) : (
            <>
              <header className="sticky top-0 z-10 flex h-20 items-center gap-3 border-b border-[var(--rule)] bg-[var(--bg)]/80 px-4 backdrop-blur-md lg:px-6">
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label={t("backToList")}
                  className="flex h-9 w-9 items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={thread.otherUser.image}
                    name={thread.otherUser.name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[15px] font-semibold text-[var(--ink)]">
                        {thread.otherUser.name}
                      </p>
                      {thread.otherUser.role === "SCOUT" && (
                        <BadgeCheck
                          className="h-4 w-4 shrink-0 text-[var(--accent)]"
                          aria-label="verified"
                        />
                      )}
                    </div>
                    {thread.otherUser.role === "MODEL" &&
                    thread.otherUser.slug ? (
                      <Link
                        href={`/m/${thread.otherUser.slug}`}
                        className="text-[12px] text-[var(--accent)] hover:underline"
                      >
                        {t("openProfile")}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setView(view === "profile" ? "thread" : "profile")
                    }
                    aria-label={t("openProfile")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] lg:hidden"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  <ConversationActionsMenu
                    hasProfile={
                      thread.otherUser.role === "MODEL" &&
                      Boolean(thread.otherUser.slug)
                    }
                    isPinned={prefs.isPinned(activeId)}
                    isArchived={prefs.isArchived(activeId)}
                    isMuted={prefs.isMuted(activeId)}
                    onTogglePin={() => prefs.togglePinned(activeId)}
                    onToggleArchive={() => prefs.toggleArchived(activeId)}
                    onToggleMute={() => prefs.toggleMuted(activeId)}
                    onReport={() => {
                      router.push(
                        `/reports/new?user=${thread.otherUser.id}` as never
                      );
                    }}
                    onDelete={() => void handleDelete()}
                    onOpenProfile={
                      thread.otherUser.role === "MODEL" && thread.otherUser.slug
                        ? () =>
                            router.push(
                              `/m/${thread.otherUser.slug}` as never
                            )
                        : undefined
                    }
                  />
                </div>
              </header>
              <div className="flex-1 min-h-0">
                <MessageThreadView
                  key={thread.conversationId}
                  conversationId={thread.conversationId}
                  initialMessages={thread.messages}
                  initialHasMore={thread.hasMore}
                  initialNextCursor={thread.nextCursor}
                  currentUserId={currentUserId}
                  otherUser={thread.otherUser}
                  otherLastReadAt={thread.otherLastReadAt}
                  onMessageSent={handleMessageSent}
                />
              </div>
            </>
          )}
        </div>

        {/* PROFILE PANEL */}
        <div
          className={cn(
            "min-h-0",
            view === "profile" ? "flex" : "hidden lg:flex",
            "flex-col"
          )}
        >
          {!thread ? (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <p className="text-[12px] text-[var(--ink-3)]">{t("selectChat")}</p>
            </div>
          ) : profileLoading ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-eyebrow text-[var(--ink-3)]">
                {t("loadingMore")}
              </span>
            </div>
          ) : (
            <ProfilePanel
              data={profileData}
              otherUserRole={thread.otherUser.role}
              onClose={() => setView("thread")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyThread({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center hairline">
        <MessageSquare className="h-5 w-5 text-[var(--ink-3)]" />
      </div>
      <p className="text-eyebrow text-[var(--ink-3)]">
        {t("selectChat")}
      </p>
      <h3 className="mt-4 text-h3 text-[var(--ink)]">
        {t("selectChat")}
      </h3>
      <p className="mt-3 max-w-sm text-[13px] leading-[1.6] text-[var(--ink-2)]">
        {t("selectChatDesc")}
      </p>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="hairline-b flex items-center gap-3 px-4 py-3 lg:px-6">
        <div className="h-10 w-10 rounded-sm bg-[var(--bg-soft)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-[var(--bg-soft)]" />
          <div className="h-2.5 w-20 bg-[var(--bg-soft)]" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-6">
        <div className="h-12 w-2/3 bg-[var(--bg-soft)]" />
        <div className="ml-auto h-12 w-1/2 bg-[var(--bg-soft)]" />
        <div className="h-12 w-3/5 bg-[var(--bg-soft)]" />
      </div>
    </div>
  );
}
