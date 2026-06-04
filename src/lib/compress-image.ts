/**
 * Client-side image compression. Resizes the longest side to `maxLongSide`
 * and re-encodes as JPEG to fit under Vercel's 4.5 MB request body limit.
 * Returns a File ready for FormData upload.
 */
export async function compressImage(
  file: File,
  { maxLongSide = 2000, quality = 0.85 }: { maxLongSide?: number; quality?: number } = {}
): Promise<File> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("image decode failed"));
    i.src = dataUrl;
  });

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longest > maxLongSide ? maxLongSide / longest : 1;
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("canvas toBlob failed");

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
