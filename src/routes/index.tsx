import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { useEvents } from "@/lib/events-store";
import type { FanEvent } from "@/lib/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "K-Star — Find Malaysia Fan Café Events" },
      {
        name: "description",
        content:
          "K-Star helps K-pop fans in Malaysia discover upcoming fan café events, freebies, and RSVP updates in one place.",
      },
      { property: "og:title", content: "K-Star — Find Malaysia Fan Café Events" },
      {
        property: "og:description",
        content:
          "Discover upcoming fan café events, check full details, and never miss RSVP updates again.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { events } = useEvents();
  const navigate = useNavigate();
  const [openEvent, setOpenEvent] = useState<FanEvent | null>(null);
  const preview = events.slice(0, 3);

  const handleDetails = (e: FanEvent) => {
    // route guests to sign in; signed-in users get the modal
    if (typeof window !== "undefined" && !localStorage.getItem("kstar.session")) {
      navigate({ to: "/signin" });
      return;
    }
    setOpenEvent(e);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-[color:var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] ring-2 ring-[color:var(--color-accent)]/30" />
              For Malaysian K-pop fans
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Fan café events,
              <br />
              <span className="text-[color:var(--color-light-foreground)]">all in one place.</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover upcoming fan café events across Malaysia. Check full details, freebies, and
              RSVP updates — without missing a beat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--color-primary-hover)]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Sign In
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[color:var(--color-light-foreground)]" /> Upcoming events
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[color:var(--color-light-foreground)]" /> KL & Selangor
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[color:var(--color-light-foreground)]" /> Freebies info
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2">
              {preview.map((e, i) => (
                <div key={e.id} className={i === 0 ? "sm:col-span-2" : ""}>
                  <EventCard event={e} onDetails={handleDetails} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-border bg-secondary p-10 text-center sm:p-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to discover your next fan café?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Create a free account to browse events, save favorites, and stay in the loop.
          </p>
          <Link
            to="/signup"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--color-primary-hover)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {openEvent && <EventModal event={openEvent} onClose={() => setOpenEvent(null)} />}
    </div>
  );
}
