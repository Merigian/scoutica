"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const remove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as { value: string; label: string }[];

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex min-h-[2.75rem] w-full items-center justify-between rounded-sm border bg-transparent px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "transition-colors border-input",
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedLabels.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selectedLabels.map((item) => (
            <span
              key={item.value}
              className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium"
            >
              {item.label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => remove(item.value, e)}
              />
            </span>
          ))}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
                <div className="absolute z-50 mt-1 w-full rounded-sm border bg-card shadow-sm max-h-60 overflow-auto">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary transition-colors",
                  isSelected && "bg-secondary/60 font-medium"
                )}
              >
                <div className={cn(
                  "h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center",
                  isSelected ? "border-primary bg-primary" : "border-input"
                )}>
                  {isSelected && (
                    <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
