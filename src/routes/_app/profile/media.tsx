import { createFileRoute } from "@tanstack/react-router";
import { AddMediaScreen } from "@/features/profile/my-athlete";

export const Route = createFileRoute("/_app/profile/media")({
  component: AddMediaScreen,
});
