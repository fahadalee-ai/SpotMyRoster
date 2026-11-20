import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/features/inbox/screens";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsScreen,
});
