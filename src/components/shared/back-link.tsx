import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href as never}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-3)] hover:text-[var(--ink)] transition-all  bg-[var(--bg-soft)]/60 hover:bg-[var(--bg-soft)] px-3 py-1.5 w-fit mb-4"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
