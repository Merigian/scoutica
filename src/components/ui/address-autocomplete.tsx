"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { resolveItalianRegion } from "@/config/regions";

export interface GeoResult {
  /** Full human-readable label (Mapbox place_name). */
  text: string;
  /** Street + civic number (empty in "city" mode). */
  address: string;
  city: string;
  region: string;
  postcode: string;
  lat: number | null;
  lng: number | null;
}

interface MapboxFeature {
  id?: string;
  text?: string;
  address?: string;
  place_name?: string;
  center?: [number, number];
  context?: Array<{ id?: string; text?: string; short_code?: string }>;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeoResult) => void;
  /** "address" returns street-level results; "city" returns town/locality results. */
  mode?: "address" | "city";
  id?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function parseFeature(f: MapboxFeature): GeoResult {
  const ctx = Array.isArray(f.context) ? f.context : [];
  const ctxEntry = (prefix: string) =>
    ctx.find((c) => typeof c.id === "string" && c.id.startsWith(prefix));
  const ctxText = (prefix: string) => ctxEntry(prefix)?.text ?? "";
  const isPlace =
    typeof f.id === "string" && (f.id.startsWith("place") || f.id.startsWith("locality"));

  const street = f.address ? `${f.text ?? ""} ${f.address}`.trim() : (f.text ?? "");
  const [lng, lat] = Array.isArray(f.center) ? f.center : [undefined, undefined];
  const regionCtx = ctxEntry("region");

  return {
    text: f.place_name ?? f.text ?? "",
    address: isPlace ? "" : street,
    city: isPlace ? (f.text ?? "") : ctxText("place") || ctxText("locality"),
    region: resolveItalianRegion(regionCtx?.short_code, regionCtx?.text),
    postcode: ctxText("postcode"),
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
  };
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  mode = "address",
  id,
  placeholder,
  error,
  disabled,
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const skipNext = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TOKEN) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const types = mode === "city" ? "place,locality" : "address";
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json` +
          `?access_token=${TOKEN}&country=it&language=it&autocomplete=true&limit=5&types=${types}`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        setResults(Array.isArray(data.features) ? data.features : []);
        setActive(-1);
        setOpen(true);
      } catch {
        /* aborted or network error — ignore */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [value, mode]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (f: MapboxFeature) => {
    const result = parseFeature(f);
    skipNext.current = true;
    onChange(mode === "city" ? result.city || result.text : result.address || result.text);
    onSelect(result);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={boxRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {loading && (
        <Loader2 className="absolute right-3 top-[22px] -translate-y-1/2 h-4 w-4 animate-spin text-[var(--ink-3)]" />
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto border border-[var(--rule-strong)] bg-[var(--bg-elevated)] shadow-lg">
          {results.map((f, i) => (
            <li key={f.id ?? i}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(f);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  i === active ? "bg-[var(--ink)]/5" : ""
                } hover:bg-[var(--ink)]/5`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-3)]" />
                <span className="text-[var(--ink-2)]">{f.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
