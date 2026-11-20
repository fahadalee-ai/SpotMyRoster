import { createFileRoute } from "@tanstack/react-router";
import { TrainingDetailScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/trainings/$trainingId")({
  component: function TrainingRoute() {
    const { trainingId } = Route.useParams();
    return <TrainingDetailScreen trainingId={trainingId} />;
  },
});
