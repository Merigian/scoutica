import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Lightweight status endpoint used to poll while waiting for the phone flow. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MODEL") {
    return NextResponse.json({ status: null }, { status: 401 });
  }

  const profile = await db.modelProfile.findUnique({
    where: { userId: session.user.id },
    select: { verificationStatus: true },
  });

  return NextResponse.json({ status: profile?.verificationStatus ?? null });
}
