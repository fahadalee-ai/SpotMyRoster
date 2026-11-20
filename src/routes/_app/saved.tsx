import { createFileRoute } from "@tanstack/react-router";
import { SavedScreen } from "@/features/applications/screens";

export const Route = createFileRoute("/_app/saved")({
  component: SavedScreen,
});
