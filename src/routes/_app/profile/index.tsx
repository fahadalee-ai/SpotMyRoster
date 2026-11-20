import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/features/profile/screens";

export const Route = createFileRoute("/_app/profile/")({
  component: ProfileScreen,
});
