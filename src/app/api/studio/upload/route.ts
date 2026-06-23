import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { putObject } from "@/lib/storage";
import { processImage } from "@/lib/process-image";
import { UPLOAD_PRESETS } from "@/lib/upload-config";

const MAX_STUDIO_IMAGES = 3;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDIO") {
      return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const studioId = formData.get("studioId") as string | null;

    if (!file || !studioId) {
      return NextResponse.json({ success: false, error: "Dati mancanti" }, { status: 400 });
    }

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Formato non supportato" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File troppo grande (max 10MB)" }, { status: 400 });
    }

    // Verify ownership
    const studioProfile = await db.studioProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!studioProfile) {
      return NextResponse.json({ success: false, error: "Profilo non trovato" }, { status: 404 });
    }

    const studio = await db.studio.findFirst({
      where: { id: studioId, studioProfileId: studioProfile.id },
      include: { _count: { select: { images: true } } },
    });
    if (!studio) {
      return NextResponse.json({ success: false, error: "Studio non trovato" }, { status: 404 });
    }

    if (studio._count.images >= MAX_STUDIO_IMAGES) {
      return NextResponse.json(
        { success: false, error: `Massimo ${MAX_STUDIO_IMAGES} immagini per studio` },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImage(inputBuffer, {
      maxLongSide: UPLOAD_PRESETS.studio.maxLongSide,
      quality: 85,
    });
    const key = `studios/${studioId}-${Date.now()}.${processed.ext}`;
    const { url } = await putObject(key, processed.buffer, processed.contentType);

    const maxOrder = await db.studioImage.findFirst({
      where: { studioId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const isFirstImage = studio._count.images === 0;

    await db.studioImage.create({
      data: {
        studioId,
        url,
        key,
        order: (maxOrder?.order ?? -1) + 1,
        isCover: isFirstImage,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Studio upload error:", error);
    return NextResponse.json({ success: false, error: "Errore durante il caricamento" }, { status: 500 });
  }
}
