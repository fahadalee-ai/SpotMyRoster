import { createFileRoute } from "@tanstack/react-router";
import { MyCoursesScreen } from "@/features/learn/screens";

export const Route = createFileRoute("/_app/learn/mine")({
  component: MyCoursesScreen,
});
