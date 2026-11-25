import { createFileRoute } from "@tanstack/react-router";
import { ManagePlanScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/subscription/manage")({
  component: ManagePlanScreen,
});
