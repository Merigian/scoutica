"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrImageProps {
  value: string;
  size?: number;
}

export function QrImage({ value, size = 200 }: QrImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="bg-[var(--bg-soft)] animate-pulse"
        style={{ width: size, height: size }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR" width={size} height={size} />;
}
