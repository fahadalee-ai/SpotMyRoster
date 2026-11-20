import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsScreen } from "@/features/applications/screens";

export const Route = createFileRoute("/_app/applications/")({
  component: ApplicationsScreen,
});
