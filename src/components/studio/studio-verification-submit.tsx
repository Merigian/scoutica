"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStudioVerification } from "@/server/actions/studio-verification";

export function StudioVerificationSubmit({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await submitStudioVerification();
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-md bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
