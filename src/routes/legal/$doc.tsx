import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "@/features/account/legal";

export const Route = createFileRoute("/legal/$doc")({
  component: function Page() {
    const params = Route.useParams();
    return <LegalScreen doc={params.doc} />;
  },
});
