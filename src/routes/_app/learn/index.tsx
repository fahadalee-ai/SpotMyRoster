import { createFileRoute } from "@tanstack/react-router";
import { LearnScreen } from "@/features/learn/screens";

export const Route = createFileRoute("/_app/learn/")({
  component: LearnScreen,
});
