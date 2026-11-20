import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background text-foreground shadow-[0_0_0_1px_var(--border)]">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
