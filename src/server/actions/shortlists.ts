"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/config/plans";
import type { ActionResponse } from "@/types";

export async function createBoard(
  name: string,
  description?: string
): Promise<ActionResponse<{ boardId: string }>> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.shortlists");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!scoutProfile) return { success: false, error: t("profileNotFound") };

  // Check plan limits
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true },
  });

  const limits = PLAN_LIMITS[subscription?.plan ?? "FREE"];
  if (limits.maxShortlistBoards === 0) {
    return { success: false, error: ts("planNoBoards") };
  }

  const boardCount = await db.shortlistBoard.count({
    where: { scoutProfileId: scoutProfile.id },
  });

  if (boardCount >= limits.maxShortlistBoards) {
    return { success: false, error: ts("boardLimitReached", { limit: limits.maxShortlistBoards }) };
  }

  const board = await db.shortlistBoard.create({
    data: {
      scoutProfileId: scoutProfile.id,
      name,
      description,
    },
  });

  return { success: true, data: { boardId: board.id } };
}

export async function deleteBoard(boardId: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.shortlists");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const board = await db.shortlistBoard.findUnique({
    where: { id: boardId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!board || board.scoutProfile.userId !== session.user.id) {
    return { success: false, error: ts("boardNotFound") };
  }

  await db.shortlistBoard.delete({ where: { id: boardId } });
  return { success: true };
}

export async function addToBoard(
  boardId: string,
  modelProfileId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.shortlists");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const board = await db.shortlistBoard.findUnique({
    where: { id: boardId },
    include: {
      scoutProfile: { select: { userId: true } },
      _count: { select: { items: true } },
    },
  });

  if (!board || board.scoutProfile.userId !== session.user.id) {
    return { success: false, error: ts("boardNotFound") };
  }

  // Check plan limits
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true },
  });

  const limits = PLAN_LIMITS[subscription?.plan ?? "FREE"];
  if (board._count.items >= limits.maxItemsPerBoard) {
    return { success: false, error: ts("itemLimitReached", { limit: limits.maxItemsPerBoard }) };
  }

  // Check if already in board
  const existing = await db.shortlistItem.findUnique({
    where: {
      boardId_modelProfileId: { boardId, modelProfileId },
    },
  });

  if (existing) {
    return { success: false, error: ts("alreadyInBoard") };
  }

  await db.shortlistItem.create({
    data: {
      boardId,
      modelProfileId,
      pipelineStage: "SAVED",
    },
  });

  return { success: true };
}

export async function removeFromBoard(
  boardId: string,
  modelProfileId: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.shortlists");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const board = await db.shortlistBoard.findUnique({
    where: { id: boardId },
    include: { scoutProfile: { select: { userId: true } } },
  });

  if (!board || board.scoutProfile.userId !== session.user.id) {
    return { success: false, error: ts("boardNotFound") };
  }

  await db.shortlistItem.delete({
    where: {
      boardId_modelProfileId: { boardId, modelProfileId },
    },
  });

  return { success: true };
}

export async function updatePipelineStage(
  itemId: string,
  stage: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.shortlists");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const item = await db.shortlistItem.findUnique({
    where: { id: itemId },
    include: {
      board: {
        include: { scoutProfile: { select: { userId: true } } },
      },
    },
  });

  if (!item || item.board.scoutProfile.userId !== session.user.id) {
    return { success: false, error: ts("itemNotFound") };
  }

  await db.shortlistItem.update({
    where: { id: itemId },
    data: { pipelineStage: stage as any },
  });

  return { success: true };
}

export async function updateItemNote(
  itemId: string,
  note: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const ts = await getTranslations("serverErrors.shortlists");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const item = await db.shortlistItem.findUnique({
    where: { id: itemId },
    include: {
      board: {
        include: { scoutProfile: { select: { userId: true } } },
      },
    },
  });

  if (!item || item.board.scoutProfile.userId !== session.user.id) {
    return { success: false, error: ts("itemNotFound") };
  }

  await db.shortlistItem.update({
    where: { id: itemId },
    data: { note },
  });

  return { success: true };
}
