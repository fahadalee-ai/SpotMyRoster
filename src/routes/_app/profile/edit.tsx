import { createFileRoute } from "@tanstack/react-router";
import { EditAthleteScreen } from "@/features/profile/my-athlete";

export const Route = createFileRoute("/_app/profile/edit")({
  component: EditAthleteScreen,
});
