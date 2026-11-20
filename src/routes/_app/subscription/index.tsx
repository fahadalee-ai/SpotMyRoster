import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/subscription/")({
  component: SubscriptionScreen,
});
