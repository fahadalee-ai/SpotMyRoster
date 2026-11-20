import { createFileRoute } from "@tanstack/react-router";
import { TournamentsScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/tournaments/")({
  component: TournamentsScreen,
});
