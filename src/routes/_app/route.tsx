import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/features/shell/AppLayout";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});
