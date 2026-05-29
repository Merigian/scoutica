"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            className={cn(
              "flex h-11 w-full border bg-transparent px-4 py-2 pr-11 text-[15px] text-[var(--ink)]",
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
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            aria-label={visible ? "Nascondi password" : "Mostra password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
