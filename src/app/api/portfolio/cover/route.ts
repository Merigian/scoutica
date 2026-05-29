import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Unset all covers, then set the chosen one
    await db.portfolioImage.updateMany({
      where: { modelProfileId: image.modelProfile.id },
      data: { isCover: false },
    });

    await db.portfolioImage.update({
      where: { id: imageId },
      data: { isCover: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set cover error:", error);
    return NextResponse.json({ success: false, error: "Errore" }, { status: 500 });
  }
}
