import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Calendar, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RsvpBadge } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { useAuth } from "@/lib/auth";
import { useEvents } from "@/lib/events-store";
import type { FanEvent } from "@/lib/events";

export const Route = createFileRoute("/organizer/")({
  head: () => ({
    meta: [
      { title: "Organizer Dashboard — K-Star" },
      { name: "description", content: "Manage your fan café events." },
    ],
  }),
  component: OrganizerDashboard,
});

function OrganizerDashboard() {
  const { user } = useAuth();
  const { events, deleteEvent } = useEvents();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<FanEvent | null>(null);

  useEffect(() => {
    if (user === null) {
      const t = setTimeout(() => {
        if (!localStorage.getItem("kstar.session")) navigate({ to: "/signin" });
      }, 50);
      return () => clearTimeout(t);
    } else if (user && user.role !== "Organizer") {
      navigate({ to: "/events" });
    }
  }, [user, navigate]);

  if (!user || user.role !== "Organizer") return null;

  const myEvents = events.filter((e) => e.organizerId === user.id);

  const onDelete = (id: string) => {
    if (typeof window !== "undefined" && window.confirm("Delete this event? This cannot be undone.")) {
      deleteEvent(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-black sm:text-4xl">HI ORGANIZER!</h1>
            <p className="mt-1 text-sm text-[#777]">Manage your fan café events here.</p>
          </div>
          <Link
            to="/organizer/new"
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#333]"
          >
            <Plus className="h-4 w-4" /> Create New Event
          </Link>
        </div>

        <h2 className="mt-10 mb-5 font-display text-2xl text-black">MY EVENTS</h2>

        {myEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/30 bg-white p-12 text-center">
            <p className="font-display text-lg text-black">You haven't created any events yet.</p>
            <p className="mt-1 text-sm text-[#777]">Click "Create New Event" to get started.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myEvents.map((e) => {
              const cover = e.images?.[0];
              return (
                <article
                  key={e.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-black bg-white"
                >
                  <div
                    className={`relative aspect-[4/3] w-full ${
                      cover ? "bg-white" : `bg-gradient-to-br ${e.poster ?? "from-[#CAF5F7] via-white to-[#FFE6EA]"}`
                    }`}
                  >
                    {cover && <img src={cover} alt={e.title} className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute right-3 top-3">
                      <RsvpBadge status={e.rsvp} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 border-t border-black p-4">
                    <h3 className="font-display text-xl text-black">{e.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-[#777]">
                      {e.group} · {e.member}
                    </p>
                    <div className="mt-1 space-y-1 text-sm text-[#666]">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {e.dateShort}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {e.location}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Link
                        to="/organizer/$eventId/edit"
                        params={{ eventId: e.id }}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-black bg-white px-2 py-2 text-xs font-semibold text-black hover:bg-[#F2FCFC]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPreview(e)}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-black bg-[#CAF5F7] px-2 py-2 text-xs font-semibold text-black hover:bg-[#B0EEF1]"
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(e.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-black bg-black px-2 py-2 text-xs font-semibold text-white hover:bg-[#333]"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {preview && <EventModal event={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
