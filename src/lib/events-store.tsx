import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  SEED_EVENTS,
  formatDateLabel,
  formatDateShort,
  type FanEvent,
} from "@/lib/events";

const STORAGE_KEY = "kstar.events";

interface EventsCtx {
  events: FanEvent[];
  getEvent: (id: string) => FanEvent | undefined;
  createEvent: (data: Omit<FanEvent, "id" | "dateLabel" | "dateShort" | "time">) => FanEvent;
  updateEvent: (id: string, data: Partial<FanEvent>) => void;
  deleteEvent: (id: string) => void;
}

const Ctx = createContext<EventsCtx | null>(null);

function uid() {
  return "ev_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadCustom(): FanEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function deriveTimes(e: Partial<FanEvent>): { time: string; dateLabel: string; dateShort: string } {
  const time =
    e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : e.time ?? "TBA";
  return {
    time,
    dateLabel: e.date ? formatDateLabel(e.date) : "",
    dateShort: e.date ? formatDateShort(e.date) : "",
  };
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<FanEvent[]>([]);

  useEffect(() => {
    setCustom(loadCustom());
  }, []);

  const persist = (next: FanEvent[]) => {
    setCustom(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn("K-Star: failed to persist events (storage full?)", err);
    }
  };

  const createEvent: EventsCtx["createEvent"] = useCallback((data) => {
    const derived = deriveTimes(data);
    const ev: FanEvent = { ...data, ...derived, id: uid() } as FanEvent;
    const next = [ev, ...loadCustom()];
    persist(next);
    return ev;
  }, []);

  const updateEvent: EventsCtx["updateEvent"] = useCallback((id, data) => {
    const list = loadCustom();
    const idx = list.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const merged = { ...list[idx], ...data };
    const derived = deriveTimes(merged);
    list[idx] = { ...merged, ...derived };
    persist(list);
  }, []);

  const deleteEvent: EventsCtx["deleteEvent"] = useCallback((id) => {
    persist(loadCustom().filter((e) => e.id !== id));
  }, []);

  const events = useMemo(
    () => [...custom, ...SEED_EVENTS].filter((e) => Array.isArray(e.images) && e.images.length > 0),
    [custom],
  );
  const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events]);

  return (
    <Ctx.Provider value={{ events, getEvent, createEvent, updateEvent, deleteEvent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
