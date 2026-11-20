import { createFileRoute } from "@tanstack/react-router";
import { VerifyScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    purpose: search.purpose === "reset" ? ("reset" as const) : ("email" as const),
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: function VerifyPage() {
    const { purpose, email } = Route.useSearch();
    return <VerifyScreen purpose={purpose} email={email} />;
  },
});
