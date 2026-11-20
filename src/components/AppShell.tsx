import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex min-h-dvh w-full min-w-0 max-w-[480px] flex-col bg-background text-foreground shadow-[0_0_0_1px_var(--border)]">
        <main className="w-full min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
