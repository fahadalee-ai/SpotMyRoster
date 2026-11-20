import { createFileRoute } from "@tanstack/react-router";
import { EventDetailScreen } from "@/features/events/screens";

export const Route = createFileRoute("/_app/events/$eventId")({
  component: function Page() {
    const params = Route.useParams();
    return <EventDetailScreen eventId={params.eventId} />;
  },
});
