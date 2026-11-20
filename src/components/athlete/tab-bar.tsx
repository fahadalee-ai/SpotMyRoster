import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, House, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { useCopy } from "@/components/athlete/ui";

const tabs = [
  { to: "/home", key: "home", icon: House },
  { to: "/teams", key: "teams", icon: Search },
  { to: "/events", key: "events", icon: CalendarDays },
  { to: "/learn", key: "learn", icon: GraduationCap },
  { to: "/chat", key: "chat", icon: MessageCircle },
] as const;

export function TabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const copy = useCopy();
  const { theme, athlete, conversations, messages } = useApp();
  const unread = athlete
    ? conversations.filter(
        (conversation) =>
          conversation.athleteId === athlete.id &&
          messages.some(
            (message) =>
              message.conversationId === conversation.id &&
              message.from === "coach" &&
              message.at > conversation.lastReadAt,
          ),
      ).length
    : 0;

  return (
    <nav
      aria-label="Primary"
      className="phone-fixed bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = tab.to === "/home" ? pathname === "/home" : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
          const Icon = tab.icon;
          const label = copy[tab.key];
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold",
                  active ? (theme === "light" ? "text-foreground" : "text-primary") : "text-muted-foreground",
                )}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
                {tab.to === "/chat" && unread > 0 && (
                  <span className="absolute right-4 top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
