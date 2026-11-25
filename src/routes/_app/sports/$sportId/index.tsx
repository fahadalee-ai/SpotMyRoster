import { createFileRoute } from "@tanstack/react-router";
import { SportScreen } from "@/features/sports/screens";

export const Route = createFileRoute("/_app/sports/$sportId/")({
  component: function Page() {
    const { sportId } = Route.useParams();
    return <SportScreen sportId={sportId} />;
  },
});
