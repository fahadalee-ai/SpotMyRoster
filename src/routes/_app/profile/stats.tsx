import { createFileRoute } from "@tanstack/react-router";
import { StatsScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/profile/stats")({
  component: StatsScreen,
});
