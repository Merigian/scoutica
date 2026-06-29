import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full border bg-transparent px-4 py-2 text-base text-[var(--ink)]",
            "placeholder:text-[var(--ink-3)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-300",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)]"
              : "border-[var(--rule-strong)] hover:border-[var(--ink)] focus:border-[var(--ink)]",
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
Input.displayName = "Input";

export { Input };
