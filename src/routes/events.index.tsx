import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { ALL_CITIES, ALL_GROUPS, type City, type FanEvent } from "@/lib/events";
import { useEvents } from "@/lib/events-store";
import { useAuth } from "@/lib/auth";

interface EventsSearch {
  event?: string;
}

export const Route = createFileRoute("/events/")({
  validateSearch: (s: Record<string, unknown>): EventsSearch => ({
    event: typeof s.event === "string" ? s.event : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Upcoming Fan Café Events — K-Star" },
      { name: "description", content: "Browse upcoming K-pop fan café events in Malaysia." },
    ],
  }),
  component: EventsPage,
});

type DateFilter = "This Week" | "This Month" | "Next Month" | "Upcoming Only";
type RsvpFilter = "RSVP Open" | "RSVP Closed" | "Full";

const DATE_FILTERS: DateFilter[] = ["This Week", "This Month", "Next Month", "Upcoming Only"];
const RSVP_FILTERS: RsvpFilter[] = ["RSVP Open", "RSVP Closed", "Full"];

interface Filters {
  cities: City[];
  groups: string[];
  date: DateFilter | null;
  rsvp: RsvpFilter[];
}
const EMPTY: Filters = { cities: [], groups: [], date: null, rsvp: [] };

function EventsPage() {
  const { user } = useAuth();
  const { events, getEvent } = useEvents();
  const navigate = useNavigate();
  const search = useSearch({ from: "/events/" });
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [panelOpen, setPanelOpen] = useState(false);
  const [openEvent, setOpenEvent] = useState<FanEvent | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user === null) {
      const t = setTimeout(() => {
        if (!localStorage.getItem("kstar.session")) navigate({ to: "/signin" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  // open modal from ?event= search param (used by organizer preview)
  useEffect(() => {
    if (search.event) {
      const ev = getEvent(search.event);
      if (ev) setOpenEvent(ev);
    }
  }, [search.event, getEvent]);

  useEffect(() => {
    if (!panelOpen) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [panelOpen]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; remove: () => void }[] = [];
    filters.cities.forEach((c) =>
      chips.push({
        key: `city-${c}`,
        label: c,
        remove: () => setFilters((f) => ({ ...f, cities: f.cities.filter((x) => x !== c) })),
      }),
    );
    filters.groups.forEach((g) =>
      chips.push({
        key: `group-${g}`,
        label: g,
        remove: () => setFilters((f) => ({ ...f, groups: f.groups.filter((x) => x !== g) })),
      }),
    );
    if (filters.date)
      chips.push({
        key: `date-${filters.date}`,
        label: filters.date,
        remove: () => setFilters((f) => ({ ...f, date: null })),
      });
    filters.rsvp.forEach((r) =>
      chips.push({
        key: `rsvp-${r}`,
        label: r,
        remove: () => setFilters((f) => ({ ...f, rsvp: f.rsvp.filter((x) => x !== r) })),
      }),
    );
    return chips;
  }, [filters]);

  const filtered = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    return events.filter((e) => {
      const q = query.trim().toLowerCase();
      if (q) {
        const hay = `${e.title} ${e.group} ${e.member} ${e.cafe} ${e.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.cities.length && !filters.cities.includes(e.city)) return false;
      if (filters.groups.length && !filters.groups.includes(e.group)) return false;
      if (filters.rsvp.length) {
        const map: Record<RsvpFilter, string> = {
          "RSVP Open": "Open",
          "RSVP Closed": "Closed",
          Full: "Full",
        };
        const allowed = filters.rsvp.map((r) => map[r]);
        if (!allowed.includes(e.rsvp)) return false;
      }
      if (filters.date) {
        const d = new Date(e.date);
        if (filters.date === "This Week" && !(d >= now && d <= weekEnd)) return false;
        if (filters.date === "This Month" && !(d >= monthStart && d <= monthEnd)) return false;
        if (filters.date === "Next Month" && !(d >= nextMonthStart && d <= nextMonthEnd)) return false;
        if (filters.date === "Upcoming Only" && d < now) return false;
      }
      return true;
    });
  }, [events, query, filters]);

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K] extends Array<infer U> ? U : never) => {
    setFilters((f) => {
      const arr = f[key] as unknown as string[];
      const exists = arr.includes(value as string);
      return {
        ...f,
        [key]: exists ? arr.filter((x) => x !== value) : [...arr, value],
      } as Filters;
    });
  };

  const closeModal = () => {
    setOpenEvent(null);
    if (search.event) navigate({ to: "/events", search: {} });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 space-y-5">
          <div>
            <h1 className="font-display text-3xl text-black sm:text-4xl">
              HI {user ? user.name.split(" ")[0].toUpperCase() : "USER"}!
            </h1>
            <p className="mt-1 text-sm text-[#777]">
              Here are the upcoming fan café events in Malaysia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by group, member, location, or event"
                className="w-full rounded-full border border-black bg-white py-3 pl-11 pr-12 text-sm text-black outline-none placeholder:text-[#999]"
              />
              <button
                type="button"
                onClick={() => setPanelOpen((o) => !o)}
                aria-label="Open filters"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-black hover:bg-[#F2FCFC]"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              className="rounded-full border border-black bg-[#CAF5F7] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#B0EEF1]"
            >
              SEARCH
            </button>
          </div>

          {panelOpen && (
            <div
              ref={panelRef}
              className="rounded-2xl border border-black bg-white p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
            >
              <FilterGroup title="Location">
                {ALL_CITIES.map((c) => (
                  <Chip key={c} active={filters.cities.includes(c)} onClick={() => toggle("cities", c)}>
                    {c}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup title="Group">
                {ALL_GROUPS.map((g) => (
                  <Chip key={g} active={filters.groups.includes(g)} onClick={() => toggle("groups", g)}>
                    {g}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup title="Date / Time Range">
                {DATE_FILTERS.map((d) => (
                  <Chip
                    key={d}
                    active={filters.date === d}
                    onClick={() => setFilters((f) => ({ ...f, date: f.date === d ? null : d }))}
                  >
                    {d}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup title="RSVP Status">
                {RSVP_FILTERS.map((r) => (
                  <Chip key={r} active={filters.rsvp.includes(r)} onClick={() => toggle("rsvp", r)}>
                    {r}
                  </Chip>
                ))}
              </FilterGroup>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#D9D9D9] pt-4">
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY)}
                  className="text-sm font-medium text-[#777] hover:text-black"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-[#333]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {activeChips.length === 0 ? (
              <span className="rounded-full border border-black bg-black px-4 py-1.5 text-sm font-semibold text-white">
                All
              </span>
            ) : (
              <>
                {activeChips.map((chip, i) => (
                  <span
                    key={chip.key}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-black px-3 py-1.5 text-sm font-medium ${
                      i === 0 ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {chip.label}
                    <button
                      onClick={chip.remove}
                      className="rounded-full p-0.5 hover:bg-white/20"
                      aria-label={`Remove ${chip.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setFilters(EMPTY)}
                  className="ml-1 text-sm font-medium text-[#777] underline underline-offset-2 hover:text-black"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        <h2 className="mb-5 font-display text-2xl text-black">UPCOMING EVENTS</h2>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/30 bg-white p-12 text-center">
            <p className="font-display text-lg text-black">
              {events.length === 0
                ? "No fan café events available yet."
                : "No fan café events found."}
            </p>
            {events.length > 0 && (
              <p className="mt-1 text-sm text-[#777]">Try changing your filters.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} onDetails={setOpenEvent} />
            ))}
          </div>
        )}
      </main>

      {openEvent && <EventModal event={openEvent} onClose={closeModal} />}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#777]">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-black bg-black text-white"
          : "border-[#D9D9D9] bg-white text-black hover:border-black"
      }`}
    >
      {children}
    </button>
  );
}
