import { createFileRoute } from "@tanstack/react-router";
import { RecruitingScreen } from "@/features/profile/my-athlete";

export const Route = createFileRoute("/_app/profile/recruiting")({
  component: RecruitingScreen,
});
