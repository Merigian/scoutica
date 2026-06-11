import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "accent" | "destructive" | "link";
type Size = "sm" | "default" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  asChild?: boolean;
}

/* Galleria buttons — ink-on-cream, no chromatic accent.
   `accent` is a back-compat alias of `default`. */
const variants: Record<Variant, string> = {
  default:     "bg-[var(--ink)] text-[var(--bg-elevated)] hover:bg-[var(--ink-2)]",
  secondary:   "bg-[var(--bg-soft)] text-[var(--ink)] hover:bg-[var(--bg-elevated)] border border-[var(--rule)]",
  outline:     "bg-transparent text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg-elevated)]",
  ghost:       "bg-transparent text-[var(--ink)] hover:bg-[var(--bg-soft)]",
  accent:      "bg-[var(--ink)] text-[var(--bg-elevated)] hover:bg-[var(--ink-2)]",
  destructive: "bg-[var(--danger)] text-[var(--bg-elevated)] hover:opacity-90",
  link:        "text-[var(--ink)] underline underline-offset-4 hover:opacity-70 bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-sm",
  default: "h-11 px-7 text-[15px]",
  lg: "h-14 px-9 text-[15px]",
  icon: "h-11 w-11",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, disabled, children, asChild = false, ...props }, ref) => {
    const buttonClasses = cn(
      "inline-flex items-center justify-center gap-2 font-[var(--font-body)] font-medium",
      "disabled:pointer-events-none disabled:opacity-50",
      "transition-colors duration-300 ease-out",
      variants[variant],
      sizes[size],
      className,
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(buttonClasses, child.props.className),
        ref,
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
