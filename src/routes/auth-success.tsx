import { createFileRoute } from "@tanstack/react-router";
import { AuthSuccessScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/auth-success")({
  component: AuthSuccessScreen,
});
