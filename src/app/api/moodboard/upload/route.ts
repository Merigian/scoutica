import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { putObject } from "@/lib/storage";
import { processImage } from "@/lib/process-image";
import { UPLOAD_PRESETS } from "@/lib/upload-config";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE = 15 * 1024 * 1024; // 15MB
const MAX_PDF = 25 * 1024 * 1024; // 25MB

/**
 * Moodboard upload — scouts/agencies/brands attach reference photos or a PDF
 * to a casting/job. Images are re-encoded (like portfolio); PDFs are stored
 * as-is. Returns the item metadata the client adds to the moodboard array.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SCOUT") {
      return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "Nessun file" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf";
    const isImage = IMAGE_TYPES.includes(file.type);
    if (!isPdf && !isImage) {
      return NextResponse.json(
        { success: false, error: "Formato non supportato (foto JPG/PNG/WEBP o PDF)" },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    if (isImage) {
      if (file.size > MAX_IMAGE) {
        return NextResponse.json({ success: false, error: "Immagine troppo grande (max 15MB)" }, { status: 400 });
      }
      const processed = await processImage(inputBuffer, {
        maxLongSide: UPLOAD_PRESETS.portfolio.maxLongSide,
        quality: 85,
      });
      const key = `moodboard/${session.user.id}-${Date.now()}.${processed.ext}`;
      const { url } = await putObject(key, processed.buffer, processed.contentType);
      return NextResponse.json({
        success: true,
        item: { kind: "IMAGE", url, key, name: file.name, mimeType: processed.contentType },
      });
    }

    // PDF
    if (file.size > MAX_PDF) {
      return NextResponse.json({ success: false, error: "PDF troppo grande (max 25MB)" }, { status: 400 });
    }
    const key = `moodboard/${session.user.id}-${Date.now()}.pdf`;
    const { url } = await putObject(key, inputBuffer, "application/pdf");
    return NextResponse.json({
      success: true,
      item: { kind: "FILE", url, key, name: file.name, mimeType: "application/pdf" },
    });
  } catch (error) {
    console.error("Moodboard upload error:", error);
    return NextResponse.json({ success: false, error: "Errore durante il caricamento" }, { status: 500 });
  }
}
