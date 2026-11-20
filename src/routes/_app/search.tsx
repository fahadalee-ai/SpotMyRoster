import { createFileRoute } from "@tanstack/react-router";
import { SearchScreen } from "@/features/inbox/screens";

export const Route = createFileRoute("/_app/search")({
  component: SearchScreen,
});
