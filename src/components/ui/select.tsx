import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, onChange, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-11 w-full border bg-[var(--bg-elevated)] px-4 py-2 pr-10 text-[15px] text-[var(--ink)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-300 appearance-none cursor-pointer",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)]"
              : "border-[var(--rule-strong)] hover:border-[var(--ink)] focus:border-[var(--ink)]",
            className,
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
        {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
