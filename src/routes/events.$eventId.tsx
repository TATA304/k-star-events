import { createFileRoute, redirect } from "@tanstack/react-router";

// Event details are shown as a modal on /events. Redirect deep links there
// with the event id as a search param so the modal opens automatically.
export const Route = createFileRoute("/events/$eventId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/events", search: { event: params.eventId } });
  },
  component: () => null,
});
