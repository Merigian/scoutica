import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { putObject, deleteObject, extFromMime } from "@/lib/storage";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Receive a live-captured verification selfie.
 *
 * Authorization is either:
 *  - an authenticated MODEL session, or
 *  - a valid `token` (from the QR "continue on phone" flow).
 *
 * The image is stored for admin review and the profile moves to
 * VERIFICATION_SUBMITTED. The single-use token is cleared on success.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const token = (formData.get("token") as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Nessun file" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Formato non supportato" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "File troppo grande" }, { status: 400 });
    }

    // Resolve target profile via session or token.
    let profile: { id: string; selfieKey: string | null; verificationStatus: string } | null = null;

    if (token) {
      const byToken = await db.modelProfile.findUnique({
        where: { verificationToken: token },
        select: {
          id: true,
          selfieKey: true,
          verificationStatus: true,
          verificationTokenExpiry: true,
        },
      });
      if (
        !byToken ||
        !byToken.verificationTokenExpiry ||
        byToken.verificationTokenExpiry.getTime() < Date.now()
      ) {
        return NextResponse.json(
          { success: false, error: "Link scaduto o non valido" },
          { status: 401 }
        );
      }
      profile = byToken;
    } else {
      const session = await auth();
      if (!session?.user?.id || session.user.role !== "MODEL") {
        return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 });
      }
      profile = await db.modelProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true, selfieKey: true, verificationStatus: true },
      });
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profilo non trovato" }, { status: 404 });
    }
    if (profile.verificationStatus === "APPROVED") {
      return NextResponse.json({ success: false, error: "Profilo già verificato" }, { status: 400 });
    }

    // Replace any previous selfie.
    if (profile.selfieKey) {
      await deleteObject(profile.selfieKey).catch(() => {});
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `verification/${profile.id}-${Date.now()}.${extFromMime(file.type)}`;
    const { url } = await putObject(key, buffer, file.type);

    await db.modelProfile.update({
      where: { id: profile.id },
      data: {
        selfieUrl: url,
        selfieKey: key,
        verificationStatus: "VERIFICATION_SUBMITTED",
        verificationSubmittedAt: new Date(),
        verificationNotes: null,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification selfie upload error:", error);
    return NextResponse.json(
      { success: false, error: "Errore durante l'invio" },
      { status: 500 }
    );
  }
}
