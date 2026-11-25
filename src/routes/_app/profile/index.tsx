import { createFileRoute } from "@tanstack/react-router";
import { MyAthleteScreen } from "@/features/profile/my-athlete";

export const Route = createFileRoute("/_app/profile/")({
  component: MyAthleteScreen,
});
