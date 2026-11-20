import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, ClipboardList, Search } from "lucide-react";
import type { ReactNode } from "react";
import { courses, events, openings, teams } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { athleteName, completeness, formatShort } from "@/lib/format";
import { courseImage } from "@/lib/images";
import { ApplicationRow, EventCard, TeamCard } from "@/components/athlete/cards";
import { Avatar, CardSkeleton, EmptyState, ErrorState, Logo, ProgressBar, PullToRefresh, useCopy, useListState, useTitle } from "@/components/athlete/ui";

export function HomeScreen() {
  const { athlete, applications, conversations, messages, notifications, enrollments } = useApp();
  const copy = useCopy();
  const list = useListState();
  useTitle(copy.home);
  if (!athlete) return null;

  const hour = new Date().getHours();
  const hello = hour < 12 ? copy.goodMorning : hour < 17 ? copy.goodAfternoon : copy.goodEvening;
  const mine = applications.filter((item) => item.athleteId === athlete.id);
  const active = mine.filter((item) => !["withdrawn", "declined", "accepted"].includes(item.status));
  const unreadNotes = notifications.filter((item) => !item.read && (!item.athleteId || item.athleteId === athlete.id)).length;
  const recommended = openings
    .map((opening) => ({ opening, team: teams.find((team) => team.id === opening.teamId) }))
    .filter((row) => row.team && athlete.sports.includes(row.team.sport) && row.team.distanceMiles <= athlete.travelRadius)
    .slice(0, 3);
  const upcoming = events
    .filter((event) => event.start.slice(0, 10) >= new Date().toISOString().slice(0, 10))
    .filter((event) => athlete.sports.includes(event.sport))
    .slice(0, 2);
  const thread = conversations.find((item) => item.athleteId === athlete.id);
  const lastMessage = thread
    ? messages.filter((item) => item.conversationId === thread.id).sort((a, b) => (a.at < b.at ? 1 : -1))[0]
    : undefined;
  const enrollment = enrollments.find((item) => item.athleteId === athlete.id);
  const course = courses.find((item) => item.id === enrollment?.courseId);
  const courseProgress = course && enrollment
    ? Math.round((enrollment.completedLessonIds.length / course.lessons.length) * 100)
    : 0;
  const score = completeness(athlete);

  return (
    <PullToRefresh onRefresh={list.refresh}>
      <div className="px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <Logo compact />
          <div className="flex items-center gap-2">
            <Link to="/search" aria-label={copy.search} className="inline-flex size-11 items-center justify-center rounded-2xl bg-elevated ring-1 ring-border">
              <Search size={18} />
            </Link>
            <Link to="/notifications" aria-label={copy.notifications} className="relative inline-flex size-11 items-center justify-center rounded-2xl bg-elevated ring-1 ring-border">
              <Bell size={18} />
              {unreadNotes > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />}
            </Link>
            <Link to="/profile" aria-label={copy.profile}>
              <Avatar name={athleteName(athlete)} src={athlete.photoUrl} size={44} />
            </Link>
          </div>
        </header>

        <p className="mt-6 text-sm text-muted-foreground">{hello}</p>
        <h1 className="font-display text-[2rem] font-semibold leading-tight">{athlete.firstName}</h1>
        <p className="text-sm text-muted-foreground">
          {athlete.city}, {athlete.state} · {athlete.positions.join(" / ") || athlete.sports.join(", ")}
        </p>

        {list.loading ? (
          <div className="mt-6">
            <CardSkeleton />
          </div>
        ) : list.error ? (
          <div className="mt-6">
            <ErrorState title="Home didn’t load" body="Check the connection and try again." onRetry={list.refresh} />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <Link to="/profile/edit" className="block rounded-3xl bg-card p-4 ring-1 ring-border">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Profile strength</p>
                <span className="text-sm font-semibold text-link">{score}%</span>
              </div>
              <ProgressBar value={score} />
            </Link>

            <div className="grid grid-cols-3 gap-2">
              <Quick to="/teams" icon={<Search size={18} />} label={copy.findTeams} />
              <Quick to="/applications" icon={<ClipboardList size={18} />} label={copy.myApplications} />
              <Quick to="/events" icon={<CalendarDays size={18} />} label={copy.upcomingTryouts} />
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Applications</h2>
                <Link to="/applications" className="text-sm font-semibold text-link">See all</Link>
              </div>
              {active.length === 0 ? (
                <EmptyState title="No open applications" body="When you apply to a roster spot, the status shows up here." to="/teams" action={copy.findTeams} />
              ) : (
                <div className="space-y-3">
                  {active.slice(0, 2).map((item) => (
                    <ApplicationRow key={item.id} application={item} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">Open spots in range</h2>
              {recommended.length === 0 ? (
                <EmptyState title="Nothing in range" body="Widen the travel radius on the profile, or browse every opening." to="/teams" action="Browse teams" />
              ) : (
                <div className="space-y-3">
                  {recommended.map((row) => row.team && <TeamCard key={row.opening.id} team={row.team} opening={row.opening} />)}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Upcoming</h2>
                <Link to="/events" className="text-sm font-semibold text-link">Calendar</Link>
              </div>
              <div className="space-y-3">
                {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events for these sports.</p>}
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>

            {lastMessage && thread && (
              <Link to="/chat/$conversationId" params={{ conversationId: thread.id }} className="block rounded-3xl bg-card p-4 ring-1 ring-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest message</p>
                <p className="mt-1 line-clamp-2 text-sm">{lastMessage.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatShort(lastMessage.at)}</p>
              </Link>
            )}

            {course && (
              <Link to="/learn/$courseId" params={{ courseId: course.id }} className="flex gap-3 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
                <img src={courseImage(course.image)} alt="" className="h-28 w-28 object-cover" />
                <span className="py-3 pr-3">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Continue learning</span>
                  <span className="mt-1 block font-semibold">{course.title}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{courseProgress}% complete</span>
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}

function Quick({ to, icon, label }: { to: "/teams" | "/applications" | "/events"; icon: ReactNode; label: string }) {
  return (
    <Link to={to} className="flex min-h-24 flex-col items-start justify-between rounded-3xl bg-card p-3 text-left ring-1 ring-border">
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">{icon}</span>
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </Link>
  );
}
