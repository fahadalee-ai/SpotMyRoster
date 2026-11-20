import { createFileRoute } from "@tanstack/react-router";
import { UpgradeScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/subscription/upgrade")({
  component: UpgradeScreen,
});
