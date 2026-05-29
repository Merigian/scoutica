import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateCompleteness } from "@/server/services/completeness";
import { unlink } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MODEL") {
      return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 });
    }

    const { imageId } = await req.json();
    if (!imageId) {
      return NextResponse.json({ success: false, error: "ID immagine mancante" }, { status: 400 });
    }

    const image = await db.portfolioImage.findUnique({
      where: { id: imageId },
      include: { modelProfile: { select: { userId: true, id: true } } },
    });

    if (!image || image.modelProfile.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Immagine non trovata" }, { status: 404 });
    }

    // Delete from DB
    await db.portfolioImage.delete({ where: { id: imageId } });

    // Try to delete file from disk
    if (image.url.startsWith("/uploads/")) {
      try {
        await unlink(join(process.cwd(), "public", image.url));
      } catch {
        // File may not exist, ignore
      }
    }

    // If deleted image was cover, set next image as cover
    if (image.isCover) {
      const nextImage = await db.portfolioImage.findFirst({
        where: { modelProfileId: image.modelProfile.id },
        orderBy: { order: "asc" },
      });
      if (nextImage) {
        await db.portfolioImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }

    // Recalculate completeness
    const profile = await db.modelProfile.findUnique({
      where: { id: image.modelProfile.id },
      include: { _count: { select: { portfolioImages: true } } },
    });
    if (profile) {
      const completenessScore = calculateCompleteness({
        ...profile,
        portfolioImageCount: profile._count.portfolioImages,
      });
      await db.modelProfile.update({
        where: { id: profile.id },
        data: { completenessScore },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ success: false, error: "Errore" }, { status: 500 });
  }
}
