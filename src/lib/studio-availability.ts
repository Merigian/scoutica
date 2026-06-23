// Shared types + helpers for a studio's weekly availability.
// Pure module (no React) so server actions and queries can import it too.

export type AvailabilityBand = { start: string; end: string };

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export type WeeklyAvailability = Record<DayKey, AvailabilityBand[]>;

export const DEFAULT_BAND: AvailabilityBand = { start: "09:00", end: "18:00" };

// 30-minute marks from 06:00 to 24:00 (inclusive). Index 12 == 06:00.
export const TIME_OPTIONS: string[] = Array.from({ length: 37 }, (_, i) => {
  const idx = 12 + i;
  const h = Math.floor(idx / 2);
  const m = idx % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

// Valid start marks (06:00 … 23:30) — a band can't start at 24:00.
export const START_OPTIONS: string[] = TIME_OPTIONS.slice(0, -1);

export function emptyWeeklyAvailability(): WeeklyAvailability {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

// Coerce an unknown value (e.g. a Prisma Json column) into a typed object.
export function parseWeeklyAvailability(value: unknown): WeeklyAvailability {
  const base = emptyWeeklyAvailability();
  if (!value || typeof value !== "object") return base;
  const obj = value as Record<string, unknown>;
  for (const day of DAY_KEYS) {
    const bands = obj[day];
    if (!Array.isArray(bands)) continue;
    base[day] = bands
      .filter(
        (b): b is AvailabilityBand =>
          !!b &&
          typeof b === "object" &&
          typeof (b as AvailabilityBand).start === "string" &&
          typeof (b as AvailabilityBand).end === "string" &&
          (b as AvailabilityBand).end > (b as AvailabilityBand).start
      )
      .map((b) => ({ start: b.start, end: b.end }));
  }
  return base;
}

export function hasAnyAvailability(weekly: WeeklyAvailability): boolean {
  return DAY_KEYS.some((d) => weekly[d].length > 0);
}

// Compact value for storage: null when nothing is set.
export function serializeWeeklyAvailability(
  weekly: WeeklyAvailability
): WeeklyAvailability | null {
  return hasAnyAvailability(weekly) ? weekly : null;
}
