"use server";

import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

const MAX_NOTE_LENGTH = 2000;

export async function upsertPrivateNote(
  modelProfileId: string,
  content: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SCOUT") {
    return { success: false, error: t("unauthorized") };
  }

  const scoutProfile = await db.scoutProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!scoutProfile) return { success: false, error: t("profileNotFound") };

  const trimmed = content.trim().slice(0, MAX_NOTE_LENGTH);

  if (trimmed.length === 0) {
    // Empty content removes the note
    await db.privateNote.deleteMany({
      where: { scoutProfileId: scoutProfile.id, modelProfileId },
    });
    revalidatePath("/[locale]/(dashboard)/profile/[slug]", "page");
    return { success: true };
  }

  await db.privateNote.upsert({
    where: {
      scoutProfileId_modelProfileId: {
        scoutProfileId: scoutProfile.id,
        modelProfileId,
      },
    },
    create: {
      scoutProfileId: scoutProfile.id,
      modelProfileId,
      content: trimmed,
    },
    update: { content: trimmed },
  });

  revalidatePath("/[locale]/(dashboard)/profile/[slug]", "page");
  return { success: true };
}
