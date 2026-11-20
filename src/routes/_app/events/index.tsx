import { createFileRoute } from "@tanstack/react-router";
import { EventsScreen } from "@/features/events/screens";

export const Route = createFileRoute("/_app/events/")({
  component: EventsScreen,
});
