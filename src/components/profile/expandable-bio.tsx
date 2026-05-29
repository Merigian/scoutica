"use client";

import { useState } from "react";

interface ExpandableBioProps {
  text: string;
  more: string;
  less: string;
}

export function ExpandableBio({ text, more, less }: ExpandableBioProps) {
  const [open, setOpen] = useState(false);
  // Only show toggle if bio is reasonably long
  const showToggle = text.length > 220 || text.split("\n").length > 3;

  return (
    <div>
      <p
        className={`font-serif text-base leading-snug text-[var(--ink)]/90 whitespace-pre-line max-w-prose ${
          !open && showToggle ? "line-clamp-3" : ""
        }`}
      >
        {text}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center text-meta text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
        >
          {open ? less : more}
        </button>
      )}
    </div>
  );
}
