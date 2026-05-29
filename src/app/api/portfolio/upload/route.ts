import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { calculateCompleteness } from "@/server/services/completeness";
import { PLAN_LIMITS } from "@/config/plans";
import type { PlanTier } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Nessun file" }, { status: 400 });
    }

    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Formato non supportato" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File troppo grande (max 10MB)" }, { status: 400 });
    }

    const profile = await db.modelProfile.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { portfolioImages: true } } },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profilo non trovato" }, { status: 404 });
    }

    // Get plan-based photo limit
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    const planTier: PlanTier = subscription?.plan ?? "FREE";
    const maxPhotos = PLAN_LIMITS[planTier].maxPhotos;

    if (profile._count.portfolioImages >= maxPhotos) {
      return NextResponse.json({ success: false, error: `Massimo ${maxPhotos} immagini` }, { status: 400 });
    }

    // Save file locally (in production, upload to R2/S3)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${profile.id}-${Date.now()}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "portfolio");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/portfolio/${filename}`;
    const key = `portfolio/${filename}`;

    const maxOrder = await db.portfolioImage.findFirst({
      where: { modelProfileId: profile.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const isFirstImage = profile._count.portfolioImages === 0;

    await db.portfolioImage.create({
      data: {
        modelProfileId: profile.id,
        url,
        key,
        sizeBytes: file.size,
        order: (maxOrder?.order ?? -1) + 1,
        isCover: isFirstImage,
      },
    });

    // Recalculate completeness
    const newCount = profile._count.portfolioImages + 1;
    const completenessScore = calculateCompleteness({
      ...profile,
      portfolioImageCount: newCount,
    });
    await db.modelProfile.update({
      where: { id: profile.id },
      data: { completenessScore },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Errore durante il caricamento" }, { status: 500 });
  }
}
