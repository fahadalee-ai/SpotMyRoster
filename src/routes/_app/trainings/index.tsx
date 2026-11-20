import { createFileRoute } from "@tanstack/react-router";
import { TrainingsScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/trainings/")({
  component: TrainingsScreen,
});
