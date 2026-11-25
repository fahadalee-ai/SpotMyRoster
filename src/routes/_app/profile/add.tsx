import { createFileRoute } from "@tanstack/react-router";
import { AddAthleteScreen } from "@/features/profile/my-athlete";

export const Route = createFileRoute("/_app/profile/add")({
  component: AddAthleteScreen,
});
