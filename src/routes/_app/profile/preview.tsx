import { createFileRoute } from "@tanstack/react-router";
import { PreviewScreen } from "@/features/profile/screens";

export const Route = createFileRoute("/_app/profile/preview")({
  component: PreviewScreen,
});
