import { createFileRoute } from "@tanstack/react-router";
import { AccountSectionScreen } from "@/features/account/screens";

export const Route = createFileRoute("/_app/account/$section")({
  component: function Page() {
    const params = Route.useParams();
    return <AccountSectionScreen section={params.section} />;
  },
});
