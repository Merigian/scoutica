import type { UserRole } from "@prisma/client";

export type ViewerRole = Extract<UserRole, "MODEL" | "SCOUT" | "STUDIO">;

export interface OtherUserSummary {
  id: string;
  name: string;
  image: string | null;
  role: UserRole;
  slug: string | null;
  lastActiveAt: Date | string | null;
}

export interface ConversationSummary {
  id: string;
  otherUser: OtherUserSummary;
  lastMessage: {
    body: string;
    senderId: string;
    createdAt: Date | string;
  } | null;
  hasUnread: boolean;
  messageCount: number;
}

export interface MessageRow {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date | string;
  pending?: boolean;
  failed?: boolean;
}
