import { createFileRoute } from "@tanstack/react-router";
import { AccountScreen } from "@/features/account/screens";

export const Route = createFileRoute("/_app/account/")({
  component: AccountScreen,
});
