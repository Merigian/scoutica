import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full border bg-transparent px-4 py-3 text-[15px] text-[var(--ink)] leading-[1.6]",
            "placeholder:text-[var(--ink-3)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y transition-colors duration-300",
            error ? "field-control field-control--error" : "field-control",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
