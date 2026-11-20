import { Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TabBar } from "@/components/athlete/tab-bar";
import { useCopy } from "@/components/athlete/ui";
import { images } from "@/lib/images";
import { useApp } from "@/lib/store";

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return online;
}

export function AppLayout() {
  const { ready, account, athlete } = useApp();
  const online = useOnline();
  const copy = useCopy();

  if (!ready) {
    return (
      <div className="splash-screen grid min-h-dvh place-items-center px-8">
        <img src={images.logoMark} alt="SpotMyRoster" className="h-auto w-full max-w-[18rem]" />
      </div>
    );
  }
  if (!account) return <Navigate to="/login" replace />;
  if (!account.emailVerified) {
    return <Navigate to="/verify" search={{ purpose: "email", email: account.email }} replace />;
  }
  if (!athlete?.setupComplete) return <Navigate to="/setup" replace />;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-xl focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      {!online && (
        <p className="bg-warning px-5 py-2 text-center text-sm font-medium text-warning-foreground" role="status">
          {copy.offline}
        </p>
      )}
      <div id="content" className="pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
