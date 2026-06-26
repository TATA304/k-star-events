import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventForm, eventToForm } from "@/components/EventForm";
import { useAuth } from "@/lib/auth";
import { useEvents } from "@/lib/events-store";

export const Route = createFileRoute("/organizer/$eventId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Event — K-Star" },
      { name: "description", content: "Edit your fan café event." },
    ],
  }),
  component: EditEventPage,
});

function EditEventPage() {
  const { user } = useAuth();
  const { getEvent, updateEvent } = useEvents();
  const { eventId } = useParams({ from: "/organizer/$eventId/edit" });
  const navigate = useNavigate();

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

  const event = getEvent(eventId);
  const initial = useMemo(() => (event ? eventToForm(event) : null), [event]);

  if (!user || user.role !== "Organizer") return null;

  if (!event || !initial) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-2xl text-black">Event not found</h1>
          <Link
            to="/organizer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#333]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/organizer"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#777] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="mb-6 font-display text-3xl text-black sm:text-4xl">EDIT EVENT</h1>

        <EventForm
          initial={initial}
          submitLabel="SAVE CHANGES"
          onCancel={() => navigate({ to: "/organizer" })}
          onSubmit={(v) => {
            updateEvent(event.id, {
              title: v.title.trim(),
              group: v.group.trim(),
              member: v.member.trim(),
              date: v.date,
              startTime: v.startTime,
              endTime: v.endTime,
              cafe: v.cafe.trim(),
              address: v.address.trim(),
              location: `${v.cafe.trim()}, ${v.city}`,
              city: v.city,
              googleMapsLink: v.googleMapsLink.trim(),
              rsvp: v.rsvp,
              freebies: v.freebies,
              organizer: v.organizer.trim() || event.organizer,
              description: v.description.trim(),
              images: v.images,
            });
            navigate({ to: "/organizer" });
          }}
        />
      </main>
    </div>
  );
}
