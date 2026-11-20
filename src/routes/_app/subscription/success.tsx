import { createFileRoute } from "@tanstack/react-router";
import { PaymentSuccessScreen } from "@/features/parent/screens";

export const Route = createFileRoute("/_app/subscription/success")({
  component: PaymentSuccessScreen,
});
