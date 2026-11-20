import { createFileRoute } from "@tanstack/react-router";
import { CoachScreen } from "@/features/teams/screens";

export const Route = createFileRoute("/_app/coaches/$coachId")({
  component: function Page() {
    const params = Route.useParams();
    return <CoachScreen coachId={params.coachId} />;
  },
});
