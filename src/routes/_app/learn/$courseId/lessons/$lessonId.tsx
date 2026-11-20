import { createFileRoute } from "@tanstack/react-router";
import { LessonScreen } from "@/features/learn/screens";

export const Route = createFileRoute("/_app/learn/$courseId/lessons/$lessonId")({
  component: function Page() {
    const { courseId, lessonId } = Route.useParams();
    return <LessonScreen courseId={courseId} lessonId={lessonId} />;
  },
});
