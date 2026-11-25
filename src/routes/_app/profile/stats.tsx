import { createFileRoute } from "@tanstack/react-router";
import { AthleteStatsScreen } from "@/features/profile/my-athlete";

export const Route = createFileRoute("/_app/profile/stats")({
  validateSearch: (search: Record<string, unknown>) => ({
    sheet: typeof search.sheet === "string" && search.sheet ? search.sheet : "batting",
  }),
  component: function Page() {
    const { sheet } = Route.useSearch();
    return <AthleteStatsScreen sheet={sheet} />;
  },
});
