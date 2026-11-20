import { createFileRoute } from "@tanstack/react-router";
import { ApplicationDetailScreen } from "@/features/applications/screens";

export const Route = createFileRoute("/_app/applications/$applicationId")({
  component: function Page() {
    const params = Route.useParams();
    return <ApplicationDetailScreen applicationId={params.applicationId} />;
  },
});
