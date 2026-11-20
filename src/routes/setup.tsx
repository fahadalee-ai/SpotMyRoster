import { createFileRoute } from "@tanstack/react-router";
import { SetupScreen } from "@/features/auth/setup";

export const Route = createFileRoute("/setup")({
  component: SetupScreen,
});
