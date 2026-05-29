"use client";

import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { enUS, it as itLocale } from "date-fns/locale";

export type LocaleCode = "it" | "en";

const localeMap = { it: itLocale, en: enUS } as const;

export function getDateFnsLocale(locale: string) {
  return locale.startsWith("it") ? localeMap.it : localeMap.en;
}

export function formatMessageTime(date: Date | string, locale: string) {
  return format(new Date(date), "HH:mm", { locale: getDateFnsLocale(locale) });
}

export function formatDayLabel(
  date: Date | string,
  locale: string,
  todayLabel: string,
  yesterdayLabel: string
) {
  const d = new Date(date);
  if (isToday(d)) return todayLabel;
  if (isYesterday(d)) return yesterdayLabel;
  return format(d, "d MMM yyyy", { locale: getDateFnsLocale(locale) });
}

export function formatListTimestamp(date: Date | string, locale: string) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "HH:mm", { locale: getDateFnsLocale(locale) });
  if (isYesterday(d)) return locale.startsWith("it") ? "Ieri" : "Yest.";
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 86_400_000;
  if (diff < 7) return format(d, "EEE", { locale: getDateFnsLocale(locale) });
  return format(d, "d MMM", { locale: getDateFnsLocale(locale) });
}

export function isSameDayLoose(a: Date | string, b: Date | string) {
  return isSameDay(new Date(a), new Date(b));
}

export function isCloseInTime(a: Date | string, b: Date | string, minutes = 2) {
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff <= minutes * 60_000;
}
