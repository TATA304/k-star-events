import type { FanEvent } from "@/lib/events";

export function RsvpBadge({ status }: { status: FanEvent["rsvp"] }) {
  const map = {
    Open: "bg-[#EAFBF0] text-[#1F7A3F] border-[#1F7A3F]/20",
    Closed: "bg-[#F2F2F2] text-[#777] border-black/10",
    Full: "bg-[#FFF7E6] text-[#A66A00] border-[#A66A00]/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${map[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      RSVP {status}
    </span>
  );
}

export function EventCard({
  event,
  onDetails,
}: {
  event: FanEvent;
  onDetails: (event: FanEvent) => void;
}) {
  const cover = event.images && event.images.length > 0 ? event.images[0] : null;
  return (
    <article className="flex flex-col gap-3">
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
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/60">
              Featuring
            </p>
            <p className="font-display text-2xl leading-tight text-black">{event.member}</p>
          </div>
        )}
      </div>

      <div className="px-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-black">{event.title}</h3>
          <span className="text-sm text-[#777]">{event.dateShort}</span>
        </div>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-[#777]">
          {event.group} · {event.member}
        </p>
        <button
          type="button"
          onClick={() => onDetails(event)}
          className="mt-3 block w-full rounded-full border border-black bg-[#CAF5F7] py-2 text-center text-sm font-semibold text-black transition hover:bg-[#B0EEF1]"
        >
          DETAILS
        </button>
      </div>
    </article>
  );
}
