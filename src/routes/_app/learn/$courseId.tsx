import { createFileRoute } from "@tanstack/react-router";
import { CourseScreen } from "@/features/learn/screens";

export const Route = createFileRoute("/_app/learn/$courseId")({
  component: function Page() {
    const params = Route.useParams();
    return <CourseScreen courseId={params.courseId} />;
  },
});
