import { createFileRoute } from "@tanstack/react-router";
import { SportListingScreen } from "@/features/sports/screens";

export const Route = createFileRoute("/_app/sports/$sportId/$listingId")({
  component: function Page() {
    const { sportId, listingId } = Route.useParams();
    return <SportListingScreen sportId={sportId} listingId={listingId} />;
  },
});
