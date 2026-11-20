import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpotMyRoster" },
      { name: "description", content: "SpotMyRoster athlete app. Find travel teams and track applications." },
    ],
  }),
  component: SplashScreen,
});
