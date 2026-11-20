import { createFileRoute } from "@tanstack/react-router";
import { MyEventsScreen } from "@/features/events/screens";

export const Route = createFileRoute("/_app/events/mine")({
  component: MyEventsScreen,
});
