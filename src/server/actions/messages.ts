"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { toPublicModelName } from "@/lib/utils";
import type { ActionResponse } from "@/types";

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

  // Get the other participant for notification
  const otherParticipant = await db.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: { not: session.user.id },
    },
    select: { userId: true, user: { select: { role: true } } },
  });

  if (otherParticipant) {
    const rolePrefix = otherParticipant.user.role === "MODEL" ? "/model"
      : otherParticipant.user.role === "SCOUT" ? "/scout"
      : otherParticipant.user.role === "STUDIO" ? "/studio" : "";

    await db.notification.create({
      data: {
        userId: otherParticipant.userId,
        type: "NEW_MESSAGE",
        title: tm("newMessageTitle"),
        body: body.length > 100 ? body.slice(0, 100) + "…" : body,
        link: `${rolePrefix}/messages/${conversationId}`,
      },
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
    const otherParticipant = p.conversation.participants[0];
    const lastMessage = p.conversation.messages[0];
    const hasUnread = lastMessage
      ? !p.lastReadAt || new Date(lastMessage.createdAt) > new Date(p.lastReadAt)
      : false;

    const otherUser = otherParticipant?.user;
    const displayName =
      otherUser?.role === "MODEL"
        ? toPublicModelName(otherUser.modelProfile?.fullName ?? otherUser.name)
        : otherUser?.role === "STUDIO"
          ? otherUser.studioProfile?.businessName ?? otherUser.name
          : otherUser?.scoutProfile?.businessName ?? otherUser?.name;

    const profileSlug =
      otherUser?.role === "MODEL"
        ? otherUser.modelProfile?.slug ?? null
        : null;

    const verified =
      otherUser?.role === "MODEL"
        ? otherUser.modelProfile?.verificationStatus === "APPROVED"
        : otherUser?.role === "SCOUT"
          ? otherUser.scoutProfile?.verificationStatus === "APPROVED"
          : otherUser?.role === "STUDIO"
            ? otherUser.studioProfile?.verificationStatus === "APPROVED"
            : false;

    return {
      id: p.conversation.id,
      otherUser: {
        id: otherUser?.id ?? "",
        name: displayName ?? tm("userFallback"),
        image: otherUser?.image ?? null,
        role: otherUser?.role ?? "MODEL",
        slug: profileSlug,
        lastActiveAt: otherUser?.lastActiveAt ?? null,
        verified,
      },
      lastMessage: lastMessage
        ? {
            body: lastMessage.body,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
          }
        : null,
      hasUnread,
      messageCount: p.conversation._count.messages,
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

  const otherParticipant = await db.conversationParticipant.findFirst({
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

  const otherUser = otherParticipant?.user;
  const displayName =
    otherUser?.role === "MODEL"
      ? toPublicModelName(otherUser.modelProfile?.fullName ?? otherUser.name)
      : otherUser?.role === "STUDIO"
        ? otherUser.studioProfile?.businessName ?? otherUser.name
        : otherUser?.scoutProfile?.businessName ?? otherUser?.name;

  const profileSlug =
    otherUser?.role === "MODEL"
      ? otherUser.modelProfile?.slug ?? null
      : null;

  const verified =
    otherUser?.role === "MODEL"
      ? otherUser.modelProfile?.verificationStatus === "APPROVED"
      : otherUser?.role === "SCOUT"
        ? otherUser.scoutProfile?.verificationStatus === "APPROVED"
        : otherUser?.role === "STUDIO"
          ? otherUser.studioProfile?.verificationStatus === "APPROVED"
          : false;

  return {
    messages,
    hasMore,
    nextCursor,
    currentUserId: session.user.id,
    otherUser: {
      id: otherUser?.id ?? "",
      name: displayName ?? tm("userFallback"),
      image: otherUser?.image ?? null,
      role: otherUser?.role ?? "MODEL",
      slug: profileSlug,
      lastActiveAt: otherUser?.lastActiveAt ?? null,
      verified,
    },
    otherLastReadAt: otherParticipant?.lastReadAt ?? null,
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
