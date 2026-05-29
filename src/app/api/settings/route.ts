import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, locale } = body;

  const updates: Record<string, any> = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (locale === "it" || locale === "en") updates.locale = locale;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: updates,
  });

  return NextResponse.json({ success: true });
}
