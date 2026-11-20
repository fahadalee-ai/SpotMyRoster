import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { coaches, teams } from "@/lib/mock-data";
import { teamCover, courseImage } from "@/lib/images";
import { formatShort, statusClass, statusLabel } from "@/lib/format";
import type { Application, Course, Opening, SportEvent, Team } from "@/lib/types";
import { Badge } from "@/components/athlete/ui";

export function TeamCard({ team, opening }: { team: Team; opening?: Opening }) {
  const coach = coaches.find((item) => item.id === team.coachId);
  return (
    <Link
      to="/teams/$teamId"
      params={{ teamId: team.id }}
      className="block overflow-hidden rounded-3xl bg-card ring-1 ring-border"
    >
      <img src={teamCover(team.id)} alt="" className="h-36 w-full object-cover" />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">{team.name}</h3>
            <p className="text-sm text-muted-foreground">
              {team.sport} · {team.ageGroup} · {team.gender}
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground">{team.level.replace(" travel", "")}</Badge>
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} aria-hidden />
          {team.city}, {team.state} · {team.distanceMiles} mi sample
        </p>
        {opening && (
          <p className="text-sm">
            <span className="font-semibold">{opening.position}</span>
            <span className="text-muted-foreground">
              {" "}
              · {opening.spots} {opening.spots === 1 ? "spot" : "spots"} · due {formatShort(opening.deadline)}
            </span>
          </p>
        )}
        {coach && <p className="text-xs text-muted-foreground">Coach {coach.name}</p>}
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: SportEvent }) {
  return (
    <Link to="/events/$eventId" params={{ eventId: event.id }} className="block rounded-3xl bg-card p-4 ring-1 ring-border">
      <div className="flex items-center justify-between gap-3">
        <Badge className="bg-elevated text-foreground ring-1 ring-border">{event.kind}</Badge>
        <span className="text-xs text-muted-foreground">{event.spotsLeft} spots listed</span>
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{event.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatShort(event.start)} · {event.city}, {event.state}
      </p>
      <p className="mt-1 text-sm">{event.sport}</p>
    </Link>
  );
}

export function CourseCard({ course, progress }: { course: Course; progress?: number }) {
  return (
    <Link to="/learn/$courseId" params={{ courseId: course.id }} className="block overflow-hidden rounded-3xl bg-card ring-1 ring-border">
      <img src={courseImage(course.image)} alt="" className="h-32 w-full object-cover" />
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {course.sport} · {course.level}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{course.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.minutes} min · {course.instructor}
        </p>
        {typeof progress === "number" && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}

export function ApplicationRow({ application }: { application: Application }) {
  const team = teams.find((item) => item.id === application.teamId);
  return (
    <Link
      to="/applications/$applicationId"
      params={{ applicationId: application.id }}
      className="block rounded-3xl bg-card p-4 ring-1 ring-border"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{team?.name ?? "Team"}</h3>
          <p className="text-sm text-muted-foreground">
            {application.position} · {formatShort(application.createdAt)}
          </p>
        </div>
        <Badge className={statusClass(application.status)}>{statusLabel(application.status)}</Badge>
      </div>
    </Link>
  );
}
