"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { toPublicModelName } from "@/lib/utils";
import type { ActionResponse } from "@/types";
import type { OtherUserSummary } from "@/components/messages/types";

type ChatParticipantUser = {
  id: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  lastActiveAt: Date | null;
  modelProfile: { fullName: string | null; slug: string | null; verificationStatus: string } | null;
  scoutProfile: { businessName: string | null; verificationStatus: string } | null;
  studioProfile: { businessName: string | null; verificationStatus: string } | null;
};

// Shared display logic for a conversation counterpart (masks model surname).
function summarizeParticipant(
  user: ChatParticipantUser | null | undefined,
  fallbackName: string
): OtherUserSummary {
  const displayName =
    user?.role === "MODEL"
      ? toPublicModelName(user.modelProfile?.fullName ?? user.name)
      : user?.role === "STUDIO"
        ? user.studioProfile?.businessName ?? user.name
        : user?.scoutProfile?.businessName ?? user?.name;

  const slug = user?.role === "MODEL" ? user.modelProfile?.slug ?? null : null;

  const verified =
    user?.role === "MODEL"
      ? user.modelProfile?.verificationStatus === "APPROVED"
      : user?.role === "SCOUT"
        ? user.scoutProfile?.verificationStatus === "APPROVED"
        : user?.role === "STUDIO"
          ? user.studioProfile?.verificationStatus === "APPROVED"
          : false;

  return {
    id: user?.id ?? "",
    name: displayName ?? fallbackName,
    image: user?.image ?? null,
    role: user?.role ?? "MODEL",
    slug,
    lastActiveAt: user?.lastActiveAt ?? null,
    verified,
  };
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<ActionResponse<{ messageId: string }>> {
  const t = await getTranslations("serverErrors");
  const tm = await getTranslations("serverErrors.messages");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  if (!body.trim() || body.length > 5000) {
    return { success: false, error: tm("invalidMessage") };
  }

  // Unverified scouts have read-only access: block messaging until approved.
  if (session.user.role === "SCOUT") {
    const scoutProfile = await db.scoutProfile.findUnique({
      where: { userId: session.user.id },
      select: { verificationStatus: true },
    });
    if (scoutProfile?.verificationStatus !== "APPROVED") {
      return { success: false, error: tm("mustBeVerified") };
    }
  }

  // Verify user is a participant
  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return { success: false, error: tm("notInConversation") };
  }

  // Create message
  const message = await db.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      body: body.trim(),
    },
  });

  // Update conversation lastMessageAt
  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // Notify every OTHER participant (works for both 1:1 and group conversations)
  const otherParticipants = await db.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { not: session.user.id },
    },
    select: { userId: true, user: { select: { role: true } } },
  });

  if (otherParticipants.length > 0) {
    const preview = body.length > 100 ? body.slice(0, 100) + "…" : body;
    await db.notification.createMany({
      data: otherParticipants.map((p) => {
        const rolePrefix =
          p.user.role === "MODEL" ? "/model"
            : p.user.role === "SCOUT" ? "/scout"
              : p.user.role === "STUDIO" ? "/studio" : "";
        return {
          userId: p.userId,
          type: "NEW_MESSAGE" as const,
          title: tm("newMessageTitle"),
          body: preview,
          link: `${rolePrefix}/messages/${conversationId}`,
        };
      }),
    });
  }

  return { success: true, data: { messageId: message.id } };
}

export async function markConversationRead(conversationId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  await db.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: session.user.id,
    },
    data: { lastReadAt: new Date() },
  });

  return { success: true };
}

export async function deleteConversation(conversationId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  // Verify participant
  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return { success: false, error: t("notFound") };
  }

  // Remove the user from the conversation (soft delete - other user keeps their copy)
  await db.conversationParticipant.delete({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  return { success: true };
}

export async function getConversations() {
  const tm = await getTranslations("serverErrors.messages");
  const session = await auth();
  if (!session?.user?.id) return [];

  const participations = await db.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            where: { userId: { not: session.user.id } },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                  lastActiveAt: true,
                  modelProfile: {
                    select: { fullName: true, slug: true, verificationStatus: true },
                  },
                  scoutProfile: {
                    select: { businessName: true, verificationStatus: true },
                  },
                  studioProfile: {
                    select: { businessName: true, verificationStatus: true },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              body: true,
              senderId: true,
              createdAt: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
  });

  return participations.map((p) => {
    const conv = p.conversation;
    const others = conv.participants; // already excludes the current user
    const lastMessage = conv.messages[0];
    const hasUnread = lastMessage
      ? !p.lastReadAt || new Date(lastMessage.createdAt) > new Date(p.lastReadAt)
      : false;

    const lastMessagePayload = lastMessage
      ? {
          body: lastMessage.body,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt,
        }
      : null;

    if (conv.isGroup) {
      const groupName = conv.name?.trim() || tm("groupFallback");
      return {
        id: conv.id,
        isGroup: true,
        name: groupName as string | null,
        otherUser: {
          id: "",
          name: groupName,
          image: null,
          role: "SCOUT" as UserRole,
          slug: null,
          lastActiveAt: null,
          verified: false,
        },
        participants: others.map((op) =>
          summarizeParticipant(op.user, tm("userFallback"))
        ) as OtherUserSummary[] | undefined,
        lastMessage: lastMessagePayload,
        hasUnread,
        messageCount: conv._count.messages,
      };
    }

    return {
      id: conv.id,
      isGroup: false,
      name: null as string | null,
      otherUser: summarizeParticipant(others[0]?.user, tm("userFallback")),
      participants: undefined as OtherUserSummary[] | undefined,
      lastMessage: lastMessagePayload,
      hasUnread,
      messageCount: conv._count.messages,
    };
  });
}

export type ConversationListItem = Awaited<ReturnType<typeof getConversations>>[number];

const MESSAGES_PAGE_SIZE = 50;
const MESSAGES_MAX_PAGE_SIZE = 100;

export async function getConversationMessages(
  conversationId: string,
  options?: { cursor?: string; limit?: number }
) {
  const tm = await getTranslations("serverErrors.messages");
  const session = await auth();
  if (!session?.user?.id) return null;

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) return null;

  const take = Math.min(
    Math.max(options?.limit ?? MESSAGES_PAGE_SIZE, 1),
    MESSAGES_MAX_PAGE_SIZE
  );

  const rows = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(options?.cursor
      ? { cursor: { id: options.cursor }, skip: 1 }
      : {}),
    select: {
      id: true,
      body: true,
      senderId: true,
      createdAt: true,
    },
  });

  const hasMore = rows.length > take;
  const slice = hasMore ? rows.slice(0, take) : rows;
  const messages = slice.slice().reverse();
  const nextCursor = hasMore ? slice[slice.length - 1].id : null;

  const conversationMeta = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { isGroup: true, name: true },
  });

  const others = await db.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { not: session.user.id },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          lastActiveAt: true,
          modelProfile: { select: { fullName: true, slug: true, verificationStatus: true } },
          scoutProfile: { select: { businessName: true, verificationStatus: true } },
          studioProfile: { select: { businessName: true, verificationStatus: true } },
        },
      },
    },
  });

  const isGroup = conversationMeta?.isGroup ?? false;
  const groupName = isGroup
    ? conversationMeta?.name?.trim() || tm("groupFallback")
    : null;
  const participants = others.map((op) =>
    summarizeParticipant(op.user, tm("userFallback"))
  );
  const otherUser: OtherUserSummary = isGroup
    ? {
        id: "",
        name: groupName ?? tm("groupFallback"),
        image: null,
        role: "SCOUT" as UserRole,
        slug: null,
        lastActiveAt: null,
        verified: false,
      }
    : summarizeParticipant(others[0]?.user, tm("userFallback"));

  return {
    messages,
    hasMore,
    nextCursor,
    currentUserId: session.user.id,
    isGroup,
    groupName,
    participants,
    otherUser,
    otherLastReadAt: isGroup ? null : others[0]?.lastReadAt ?? null,
  };
}

export type ConversationMessagesPayload = NonNullable<
  Awaited<ReturnType<typeof getConversationMessages>>
>;

export async function searchMessagesInConversation(
  conversationId: string,
  query: string
) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });
  if (!participant) return [];

  const rows = await db.message.findMany({
    where: {
      conversationId,
      body: { contains: trimmed, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, body: true, senderId: true, createdAt: true },
  });

  return rows;
}

export async function getModelProfileForChat(userId: string) {
  return db.modelProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      slug: true,
      fullName: true,
      verificationStatus: true,
      dateOfBirth: true,
      gender: true,
      city: true,
      region: true,
      bio: true,
      height: true,
      bust: true,
      waist: true,
      hips: true,
      shoeSize: true,
      dressSize: true,
      eyeColor: true,
      hairColor: true,
      ethnicity: true,
      categories: true,
      professionalStatus: true,
      spokenLanguages: true,
      travelAvailability: true,
      instagramUrl: true,
      tiktokUrl: true,
      websiteUrl: true,
      followerCount: true,
      portfolioImages: {
        orderBy: { order: "asc" as const },
        select: { id: true, url: true, isCover: true },
      },
    },
  });
}

export async function getStudioProfileForChat(userId: string) {
  return db.studioProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      businessName: true,
      city: true,
      region: true,
      bio: true,
      websiteUrl: true,
      phoneNumber: true,
      studios: {
        orderBy: { createdAt: "asc" as const },
        take: 3,
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          studioType: true,
          hourlyRate: true,
          dailyRate: true,
          images: {
            orderBy: { order: "asc" as const },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });
}

export async function getScoutProfileForChat(userId: string) {
  return db.scoutProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      businessName: true,
      roleTitle: true,
      city: true,
      bio: true,
      websiteUrl: true,
      socialProfileUrl: true,
      verificationStatus: true,
    },
  });
}

// People a scout may add to a group: only counterparts they already have a
// one-to-one conversation with (i.e. an accepted contact request).
export async function getGroupCandidates(): Promise<OtherUserSummary[]> {
  const tm = await getTranslations("serverErrors.messages");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") return [];

  const existing = await db.conversationParticipant.findMany({
    where: {
      userId: { not: session.user.id },
      conversation: {
        isGroup: false,
        participants: { some: { userId: session.user.id } },
      },
    },
    distinct: ["userId"],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          lastActiveAt: true,
          modelProfile: { select: { fullName: true, slug: true, verificationStatus: true } },
          scoutProfile: { select: { businessName: true, verificationStatus: true } },
          studioProfile: { select: { businessName: true, verificationStatus: true } },
        },
      },
    },
  });

  return existing.map((e) => summarizeParticipant(e.user, tm("userFallback")));
}

export async function createGroupConversation(
  name: string,
  participantUserIds: string[]
): Promise<ActionResponse<{ conversationId: string }>> {
  const t = await getTranslations("serverErrors");
  const tm = await getTranslations("serverErrors.messages");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }

  // Only scouts/agencies/brands may create groups, and only once verified.
  if (session.user.role !== "SCOUT") {
    return { success: false, error: tm("groupOnlyScouts") };
  }
  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { verificationStatus: true },
  });
  if (scoutProfile?.verificationStatus !== "APPROVED") {
    return { success: false, error: tm("mustBeVerified") };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 100) {
    return { success: false, error: tm("groupNameRequired") };
  }

  const currentUserId = session.user.id;
  const uniqueIds = Array.from(new Set(participantUserIds)).filter(
    (id) => id && id !== currentUserId
  );
  if (uniqueIds.length < 2) {
    return { success: false, error: tm("groupTooFewMembers") };
  }
  if (uniqueIds.length > 30) {
    return { success: false, error: tm("groupTooManyMembers") };
  }

  // Security: the scout may only add people they already have a 1:1
  // conversation with. Anything outside that set is rejected.
  const existing = await db.conversationParticipant.findMany({
    where: {
      userId: { not: currentUserId },
      conversation: {
        isGroup: false,
        participants: { some: { userId: currentUserId } },
      },
    },
    select: { userId: true },
  });
  const allowed = new Set(existing.map((e) => e.userId));
  const invalid = uniqueIds.filter((id) => !allowed.has(id));
  if (invalid.length > 0) {
    return { success: false, error: tm("groupInvalidMembers") };
  }

  const conversation = await db.conversation.create({
    data: {
      isGroup: true,
      name: trimmedName,
      createdById: currentUserId,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: currentUserId },
          ...uniqueIds.map((userId) => ({ userId })),
        ],
      },
    },
    select: { id: true },
  });

  // Notify the members they were added to a new group.
  const members = await db.user.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, role: true },
  });
  await db.notification.createMany({
    data: members.map((m) => {
      const rolePrefix =
        m.role === "MODEL" ? "/model"
          : m.role === "SCOUT" ? "/scout"
            : m.role === "STUDIO" ? "/studio" : "";
      return {
        userId: m.id,
        type: "NEW_MESSAGE" as const,
        title: tm("groupCreatedTitle"),
        body: trimmedName,
        link: `${rolePrefix}/messages/${conversation.id}`,
      };
    }),
  });

  return { success: true, data: { conversationId: conversation.id } };
}
