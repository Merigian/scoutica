"use client";

import { useCallback, useEffect, useState } from "react";

type PrefKey = "pinned" | "archived" | "muted";

const STORAGE_PREFIX = "scoutica:conv:";

type PrefMap = Record<string, true>;

function readMap(key: PrefKey): PrefMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as PrefMap) : {};
  } catch {
    return {};
  }
}

function writeMap(key: PrefKey, map: PrefMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("scoutica:conv-prefs"));
  } catch {
    // ignore quota errors
  }
}

export function useConversationPrefs() {
  const [pinned, setPinned] = useState<PrefMap>({});
  const [archived, setArchived] = useState<PrefMap>({});
  const [muted, setMuted] = useState<PrefMap>({});

  useEffect(() => {
    const refresh = () => {
      setPinned(readMap("pinned"));
      setArchived(readMap("archived"));
      setMuted(readMap("muted"));
    };
    refresh();
    window.addEventListener("scoutica:conv-prefs", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("scoutica:conv-prefs", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const toggle = useCallback((key: PrefKey, id: string) => {
    const map = readMap(key);
    if (map[id]) delete map[id];
    else map[id] = true;
    writeMap(key, map);
  }, []);

  return {
    pinned,
    archived,
    muted,
    isPinned: (id: string) => Boolean(pinned[id]),
    isArchived: (id: string) => Boolean(archived[id]),
    isMuted: (id: string) => Boolean(muted[id]),
    togglePinned: (id: string) => toggle("pinned", id),
    toggleArchived: (id: string) => toggle("archived", id),
    toggleMuted: (id: string) => toggle("muted", id),
  };
}
