import { createFileRoute } from "@tanstack/react-router";
import { TournamentDetailScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/tournaments/$tournamentId")({
  component: function TournamentRoute() {
    const { tournamentId } = Route.useParams();
    return <TournamentDetailScreen tournamentId={tournamentId} />;
  },
});
