import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_STUDIO_IMAGES = 10;

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

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${studioId}-${Date.now()}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "studios");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/studios/${filename}`;
    const key = `studios/${filename}`;

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
