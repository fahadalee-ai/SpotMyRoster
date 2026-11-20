import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { coaches, courses, events, teams } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { NoticeCategory } from "@/lib/types";
import { formatShort } from "@/lib/format";
import { Btn, Chip, ChipRow, EmptyState, Page, PullToRefresh, SearchField, useListState } from "@/components/athlete/ui";

const categories: Array<NoticeCategory | "All"> = ["All", "Applications", "Messages", "Events", "Teams", "System"];

export function NotificationsScreen() {
  const { athlete, notifications, markNotificationRead, markAllRead, clearNotifications, prefs } = useApp();
  const navigate = useNavigate();
  const [category, setCategory] = useState<NoticeCategory | "All">("All");
  const list = useListState();
  const visible = notifications.filter((item) => {
    if (item.athleteId && item.athleteId !== athlete?.id) return false;
    if (category !== "All" && item.category !== category) return false;
    const key = item.category.toLowerCase() as keyof typeof prefs;
    if (key in prefs && prefs[key] === false && category === "All") return false;
    return true;
  });

  return (
    <Page
      title="Notifications"
      right={<button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={markAllRead}>Read all</button>}
    >
      <ChipRow className="mb-3">
        {categories.map((item) => <Chip key={item} selected={category === item} onClick={() => setCategory(item)}>{item}</Chip>)}
      </ChipRow>
      <PullToRefresh onRefresh={list.refresh}>
        {visible.length === 0 ? (
          <EmptyState title="You’re caught up" body="Application, message, event, and team notices show up here." />
        ) : (
          <ul className="space-y-2">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    markNotificationRead(item.id);
                    if (item.href) navigate({ href: item.href });
                  }}
                  className={`w-full rounded-3xl px-4 py-3 text-left ring-1 ring-border ${item.read ? "bg-card" : "bg-elevated"}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.category} · {formatShort(item.at)}</span>
                  <span className="mt-1 block font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{item.body}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {notifications.length > 0 && (
          <Btn variant="ghost" className="mt-4" onClick={clearNotifications}>Clear all</Btn>
        )}
      </PullToRefresh>
    </Page>
  );
}

export function SearchScreen() {
  const { recentSearches, addRecentSearch, clearRecentSearches } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const list = useListState();
  const term = query.trim().toLowerCase();
  const teamHits = teams.filter((team) => `${team.name} ${team.city} ${team.sport}`.toLowerCase().includes(term));
  const coachHits = coaches.filter((coach) => coach.name.toLowerCase().includes(term));
  const eventHits = events.filter((event) => `${event.title} ${event.city} ${event.sport}`.toLowerCase().includes(term));
  const courseHits = courses.filter((course) => `${course.title} ${course.sport} ${course.category}`.toLowerCase().includes(term));
  const suggestions = ["16U baseball", "Naperville", "tryout", "hitting"];

  return (
    <Page title="Search">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (query.trim()) addRecentSearch(query.trim());
        }}
      >
        <SearchField value={query} onChange={setQuery} placeholder="Teams, coaches, events, courses" />
      </form>
      {!term && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Recent</h2>
            {recentSearches.length > 0 && <button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={clearRecentSearches}>Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {(recentSearches.length ? recentSearches : suggestions).map((item) => (
              <Chip key={item} onClick={() => setQuery(item)}>{item}</Chip>
            ))}
          </div>
          {recentSearches.length === 0 && <p className="mt-3 text-xs text-muted-foreground">Suggestions until you search.</p>}
        </div>
      )}
      {term && list.error && <p className="mt-4 text-sm">Search needs a connection in this sample check.</p>}
      {term && !list.loading && teamHits.length + coachHits.length + eventHits.length + courseHits.length === 0 && (
        <div className="mt-4"><EmptyState title="No matches" body="Try a sport, a city, or a course topic." /></div>
      )}
      {term && (
        <div className="mt-5 space-y-5">
          <Group title="Teams" empty={teamHits.length === 0}>
            {teamHits.map((team) => <Row key={team.id} title={team.name} detail={`${team.sport} · ${team.city}`} onClick={() => { addRecentSearch(query); navigate({ to: "/teams/$teamId", params: { teamId: team.id } }); }} />)}
          </Group>
          <Group title="Coaches" empty={coachHits.length === 0}>
            {coachHits.map((coach) => <Row key={coach.id} title={coach.name} detail={`${coach.city}, ${coach.state}`} onClick={() => navigate({ to: "/coaches/$coachId", params: { coachId: coach.id } })} />)}
          </Group>
          <Group title="Events" empty={eventHits.length === 0}>
            {eventHits.map((event) => <Row key={event.id} title={event.title} detail={event.city} onClick={() => navigate({ to: "/events/$eventId", params: { eventId: event.id } })} />)}
          </Group>
          <Group title="Courses" empty={courseHits.length === 0}>
            {courseHits.map((course) => <Row key={course.id} title={course.title} detail={course.sport} onClick={() => navigate({ to: "/learn/$courseId", params: { courseId: course.id } })} />)}
          </Group>
        </div>
      )}
    </Page>
  );
}

function Group({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  if (empty) return null;
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-card px-3 text-left ring-1 ring-border">
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </span>
      <span aria-hidden>›</span>
    </button>
  );
}
