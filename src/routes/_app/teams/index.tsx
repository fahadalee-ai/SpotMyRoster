import { createFileRoute } from "@tanstack/react-router";
import { TeamsScreen } from "@/features/teams/screens";

export const Route = createFileRoute("/_app/teams/")({
  component: TeamsScreen,
});
