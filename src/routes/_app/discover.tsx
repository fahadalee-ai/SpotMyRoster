import { createFileRoute } from "@tanstack/react-router";
import { DiscoverScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/discover")({
  component: DiscoverScreen,
});
