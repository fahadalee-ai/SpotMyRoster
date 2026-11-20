import { createFileRoute } from "@tanstack/react-router";
import { ChatThreadScreen } from "@/features/chat/screens";

export const Route = createFileRoute("/_app/chat/$conversationId")({
  component: function Page() {
    const params = Route.useParams();
    return <ChatThreadScreen conversationId={params.conversationId} />;
  },
});
