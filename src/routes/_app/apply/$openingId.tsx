import { createFileRoute } from "@tanstack/react-router";
import { ApplyScreen } from "@/features/teams/screens";

export const Route = createFileRoute("/_app/apply/$openingId")({
  component: function Page() {
    const params = Route.useParams();
    return <ApplyScreen openingId={params.openingId} />;
  },
});
