import { createFileRoute } from "@tanstack/react-router";
import { ChatListScreen } from "@/features/chat/screens";

export const Route = createFileRoute("/_app/chat/")({
  component: ChatListScreen,
});
