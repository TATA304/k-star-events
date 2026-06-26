import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventForm, EMPTY_FORM } from "@/components/EventForm";
import { useAuth } from "@/lib/auth";
import { useEvents } from "@/lib/events-store";

export const Route = createFileRoute("/organizer/new")({
  head: () => ({
    meta: [
      { title: "Create Event — K-Star" },
      { name: "description", content: "Create a new fan café event." },
    ],
  }),
  component: CreateEventPage,
});

function CreateEventPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents();
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

  if (!user || user.role !== "Organizer") return null;

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
        <h1 className="mb-6 font-display text-3xl text-black sm:text-4xl">CREATE NEW EVENT</h1>

        <EventForm
          initial={{ ...EMPTY_FORM, organizer: user.name ? `@${user.name.replace(/\s+/g, "_").toLowerCase()}` : "" }}
          submitLabel="CREATE EVENT"
          onCancel={() => navigate({ to: "/organizer" })}
          onSubmit={(v) => {
            createEvent({
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
              organizer: v.organizer.trim() || "@organizer",
              organizerId: user.id,
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
