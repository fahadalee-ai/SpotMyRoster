import { createFileRoute } from "@tanstack/react-router";
import { ComparePlansScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/subscription/compare")({
  component: ComparePlansScreen,
});
