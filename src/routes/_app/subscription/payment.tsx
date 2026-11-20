import { createFileRoute } from "@tanstack/react-router";
import { PaymentScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/subscription/payment")({
  component: PaymentScreen,
});
