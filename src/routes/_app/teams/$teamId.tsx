import { createFileRoute } from "@tanstack/react-router";
import { TeamDetailScreen } from "@/features/teams/screens";

export const Route = createFileRoute("/_app/teams/$teamId")({
  component: function Page() {
    const params = Route.useParams();
    return <TeamDetailScreen teamId={params.teamId} />;
  },
});
