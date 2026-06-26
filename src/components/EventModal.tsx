import { useEffect, useState } from "react";
import { X, Calendar, Clock, MapPin, Gift, AtSign, Coffee, ExternalLink } from "lucide-react";
import { RsvpBadge } from "@/components/EventCard";
import type { FanEvent } from "@/lib/events";

export function EventModal({ event, onClose }: { event: FanEvent; onClose: () => void }) {
  const images = event.images && event.images.length > 0 ? event.images : [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const mapsHref =
    event.googleMapsLink && event.googleMapsLink.trim().length > 0
      ? event.googleMapsLink
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;

  const cover = images[active];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-t-3xl border border-black bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-black bg-white text-black transition hover:bg-[#F2FCFC]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid max-h-[95vh] overflow-y-auto md:grid-cols-2">
          {/* Image side */}
          <div className="border-b border-black bg-white p-5 md:border-b-0 md:border-r">
            <div
              className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-black ${
                cover ? "bg-white" : `bg-gradient-to-br ${event.poster ?? "from-[#CAF5F7] via-white to-[#FFE6EA]"}`
              }`}
            >
              {cover && (
                <img src={cover} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute left-3 top-3">
                <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
                  {event.group}
                </span>
              </div>
              <div className="absolute right-3 top-3">
                <RsvpBadge status={event.rsvp} />
              </div>
              {!cover && (
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/60">Featuring</p>
                  <p className="font-display text-3xl leading-tight text-black">{event.member}</p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`aspect-square overflow-hidden rounded-xl border ${
                      i === active ? "border-black ring-2 ring-[#CAF5F7]" : "border-[#D9D9D9] hover:border-black"
                    }`}
                  >
                    <img src={src} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details side */}
          <div className="space-y-6 p-6 sm:p-8">
            <header>
              <h1 className="font-display text-3xl tracking-tight text-black sm:text-4xl">{event.title}</h1>
              <p className="mt-1 text-sm text-[#777]">
                Celebrating <span className="font-semibold text-black">{event.member}</span> of{" "}
                <span className="font-semibold text-black">{event.group}</span>
              </p>
            </header>

            <div className="grid gap-2 sm:grid-cols-2">
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date" value={event.dateLabel} />
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Time" value={event.time} />
              <InfoRow icon={<Coffee className="h-4 w-4" />} label="Café" value={event.cafe} />
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-2xl border border-black bg-[#F2FCFC] px-4 py-3 transition hover:bg-[#CAF5F7]"
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black bg-white text-black">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666]">Location</p>
                  <p className="truncate text-sm font-medium text-black">{event.address}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-black">
                    Open in Google Maps <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </a>
            </div>

            <section>
              <h2 className="mb-2 flex items-center gap-2 font-display text-lg text-black">
                <Gift className="h-4 w-4" /> Freebies
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.freebies.length === 0 ? (
                  <span className="text-sm text-[#777]">No freebies listed.</span>
                ) : (
                  event.freebies.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-black bg-[#F2FCFC] px-3 py-1 text-xs font-medium text-black"
                    >
                      {f}
                    </span>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-display text-lg text-black">About this event</h2>
              <p className="text-sm leading-relaxed text-[#666]">
                {event.description?.trim() ||
                  "This fan café event is created for fans to celebrate the artist's birthday. Visit the café, collect freebies, take photos, and enjoy themed decorations."}
              </p>
            </section>

            <section className="flex items-center gap-3 rounded-2xl border border-black bg-white px-4 py-3">
              <AtSign className="h-4 w-4 text-[#666]" />
              <div className="text-sm">
                <span className="text-[#777]">Organizer · </span>
                <span className="font-semibold text-black">{event.organizer}</span>
              </div>
            </section>

            <button
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-[#F2F2F2] px-6 py-3 text-sm font-semibold text-[#777]"
              title="RSVP feature coming soon"
            >
              RSVP Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#D9D9D9] bg-white px-4 py-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#D9D9D9] bg-white text-black">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666]">{label}</p>
        <p className="truncate text-sm font-medium text-black">{value}</p>
      </div>
    </div>
  );
}
