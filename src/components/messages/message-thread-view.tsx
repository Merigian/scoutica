"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getConversationMessages,
  markConversationRead,
  sendMessage,
} from "@/server/actions/messages";
import {
  formatDayLabel,
  formatMessageTime,
  isCloseInTime,
  isSameDayLoose,
} from "./format";
import { DateSeparator, MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import type { MessageRow, OtherUserSummary } from "./types";

interface MessageThreadViewProps {
  conversationId: string;
  initialMessages: MessageRow[];
  initialHasMore: boolean;
  initialNextCursor: string | null;
  currentUserId: string;
  otherUser: OtherUserSummary;
  otherLastReadAt: Date | string | null;
  isGroup?: boolean;
  participants?: OtherUserSummary[];
  onMessageSent?: (preview: { body: string; createdAt: Date }) => void;
}

const SCROLL_PIN_THRESHOLD = 80;

export function MessageThreadView({
  conversationId,
  initialMessages,
  initialHasMore,
  initialNextCursor,
  currentUserId,
  otherUser,
  otherLastReadAt,
  isGroup = false,
  participants,
  onMessageSent,
}: MessageThreadViewProps) {
  const t = useTranslations("components.messaging");
  const locale = useLocale();

  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
    setHasMore(initialHasMore);
    setCursor(initialNextCursor);
    setUnseenCount(0);
    setPinnedToBottom(true);
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: "end" });
    });
    void markConversationRead(conversationId);
  }, [conversationId, initialMessages, initialHasMore, initialNextCursor]);

  useEffect(() => {
    if (!pinnedToBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pinnedToBottom]);

  useEffect(() => {
    const el = previousScrollHeightRef.current;
    if (el === null || !scrollRef.current) return;
    const diff = scrollRef.current.scrollHeight - el;
    scrollRef.current.scrollTop = diff;
    previousScrollHeightRef.current = null;
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= SCROLL_PIN_THRESHOLD;
    setPinnedToBottom(atBottom);
    if (atBottom) setUnseenCount(0);
  }, []);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || !cursor) return;
    setLoadingOlder(true);
    previousScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null;
    const payload = await getConversationMessages(conversationId, { cursor });
    if (payload) {
      setMessages((prev) => [...payload.messages, ...prev]);
      setHasMore(payload.hasMore);
      setCursor(payload.nextCursor);
    }
    setLoadingOlder(false);
  }, [conversationId, cursor, hasMore, loadingOlder]);

  const handleSend = useCallback(
    async (body: string) => {
      const tempId = `tmp-${Date.now()}`;
      const optimistic: MessageRow = {
        id: tempId,
        body,
        senderId: currentUserId,
        createdAt: new Date(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setPinnedToBottom(true);

      const res = await sendMessage(conversationId, body);

      if (res.success && res.data) {
        const newId = res.data.messageId;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, id: newId, pending: false } : m
          )
        );
        startTransition(() => {
          onMessageSent?.({ body, createdAt: new Date() });
        });
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, pending: false, failed: true } : m
          )
        );
      }
    },
    [conversationId, currentUserId, onMessageSent]
  );

  const handleRetry = useCallback(
    async (failedId: string) => {
      const target = messages.find((m) => m.id === failedId);
      if (!target) return;
      setMessages((prev) => prev.filter((m) => m.id !== failedId));
      await handleSend(target.body);
    },
    [messages, handleSend]
  );

  const grouped = useMemo(() => buildGroups(messages), [messages]);

  const senderNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of participants ?? []) map.set(p.id, p.name);
    return map;
  }, [participants]);

  const lastReceiptIndex = useMemo(() => {
    if (!otherLastReadAt) return -1;
    const readAt = new Date(otherLastReadAt).getTime();
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderId === currentUserId && new Date(m.createdAt).getTime() <= readAt) {
        return i;
      }
    }
    return -1;
  }, [messages, otherLastReadAt, currentUserId]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg)]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label={t("title")}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8">
          {hasMore && (
            <div className="mb-6 flex justify-center">
              <button
                type="button"
                onClick={loadOlder}
                disabled={loadingOlder}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--bg-soft)] px-4 py-2 lg:min-h-0",
                  "text-[12px] font-medium text-[var(--ink-2)] hover:bg-[var(--bg-soft)]/70 hover:text-[var(--ink)] transition-colors",
                  loadingOlder && "opacity-60 cursor-wait"
                )}
              >
                {loadingOlder ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("loadingMore")}
                  </>
                ) : (
                  t("loadOlder")
                )}
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-[14px] font-semibold text-[var(--ink-2)]">
                {t("emptyThread")}
              </p>
              <p className="mt-2 max-w-sm text-[13px] leading-[1.6] text-[var(--ink-3)]">
                {t("emptyThreadDesc")}
              </p>
            </div>
          ) : (
            grouped.map((entry, idx) => {
              if (entry.kind === "separator") {
                return (
                  <DateSeparator
                    key={`sep-${idx}`}
                    label={formatDayLabel(
                      entry.date,
                      locale,
                      t("today"),
                      t("yesterday")
                    )}
                  />
                );
              }
              const group = entry.group;
              const groupIsMine = group[0].senderId === currentUserId;
              return (
                <div
                  key={`grp-${group[0].id}`}
                  className={cn("flex flex-col gap-0.5 py-1")}
                >
                  {isGroup && !groupIsMine && (
                    <p className="mb-0.5 pl-1 text-[11px] font-medium text-[var(--ink-3)]">
                      {senderNames.get(group[0].senderId) ?? otherUser.name}
                    </p>
                  )}
                  {group.map((msg, mi) => {
                    const isMine = msg.senderId === currentUserId;
                    const isFirst = mi === 0;
                    const isLast = mi === group.length - 1;
                    const showTime = isLast;
                    const showReceipt =
                      isMine &&
                      isLast &&
                      messages.indexOf(msg) === lastReceiptIndex;
                    return (
                      <div key={msg.id} className="flex flex-col">
                        <MessageBubble
                          body={msg.body}
                          isMine={isMine}
                          isFirstInGroup={isFirst}
                          isLastInGroup={isLast}
                          pending={msg.pending}
                          failed={msg.failed}
                          timeLabel={
                            showTime
                              ? formatMessageTime(msg.createdAt, locale)
                              : undefined
                          }
                          ariaLabel={`${isMine ? "you" : senderNames.get(msg.senderId) ?? otherUser.name} · ${msg.body}`}
                        />
                        {msg.failed && (
                          <div
                            className={cn(
                              "mt-1 flex items-center gap-2 self-end",
                              "text-[11px] font-medium"
                            )}
                          >
                            <span className="text-[var(--accent)]">
                              {t("sendFailed")}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleRetry(msg.id)}
                              className="p-2 -m-2 text-[var(--ink)] underline-offset-4 hover:underline"
                            >
                              {t("retry")}
                            </button>
                          </div>
                        )}
                        {showReceipt && (
                          <p
                            className={cn(
                              "mt-1 self-end text-[11px] text-[var(--ink-3)]"
                            )}
                          >
                            {t("readAt", {
                              time: formatMessageTime(
                                otherLastReadAt!,
                                locale
                              ),
                            })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          <div ref={bottomRef} aria-hidden />
        </div>

        {!pinnedToBottom && (
          <button
            type="button"
            onClick={() =>
              bottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
              })
            }
            aria-label={t("scrollToBottom")}
            className={cn(
              "sticky bottom-4 ml-auto mr-4 mb-2 flex min-h-11 items-center gap-2 rounded-full px-4 py-2 lg:min-h-0",
              "bg-[var(--accent)] text-[var(--bg)] shadow-md hover:opacity-90 transition-opacity",
              "text-[12px] font-medium"
            )}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {unseenCount > 0 ? t("newMessages") : t("scrollToBottom")}
          </button>
        )}
      </div>

      <MessageComposer onSubmit={handleSend} />
    </div>
  );
}

type Entry =
  | { kind: "separator"; date: Date }
  | { kind: "group"; group: MessageRow[] };

function buildGroups(messages: MessageRow[]): Entry[] {
  const out: Entry[] = [];
  let lastDate: Date | null = null;
  let currentGroup: MessageRow[] = [];

  const flush = () => {
    if (currentGroup.length > 0) {
      out.push({ kind: "group", group: currentGroup });
      currentGroup = [];
    }
  };

  messages.forEach((m, i) => {
    const d = new Date(m.createdAt);
    if (!lastDate || !isSameDayLoose(lastDate, d)) {
      flush();
      out.push({ kind: "separator", date: d });
      lastDate = d;
    }
    const prev = messages[i - 1];
    const sameAuthor = prev && prev.senderId === m.senderId;
    const closeInTime = prev && isCloseInTime(prev.createdAt, m.createdAt);
    if (currentGroup.length === 0 || !sameAuthor || !closeInTime) {
      flush();
    }
    currentGroup.push(m);
  });
  flush();
  return out;
}
