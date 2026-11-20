import { createFileRoute } from "@tanstack/react-router";
import { PasswordUpdatedScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/password-updated")({
  component: PasswordUpdatedScreen,
});
