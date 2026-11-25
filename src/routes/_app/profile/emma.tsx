import { createFileRoute } from "@tanstack/react-router";
import { EmmaProfileScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/profile/emma")({
  component: EmmaProfileScreen,
});
