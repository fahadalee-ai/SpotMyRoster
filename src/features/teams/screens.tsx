import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { coaches, openings, teams } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { TeamFilters } from "@/lib/types";
import { formatShort, mapsUrl, shareOrCopy } from "@/lib/format";
import { teamCover } from "@/lib/images";
import { TeamCard } from "@/components/athlete/cards";
import { Badge, BottomSheet, Btn, CardSkeleton, Chip, ChipRow, EmptyState, ErrorState, IconButton, Page, PullToRefresh, SearchField, useListState, useTitle } from "@/components/athlete/ui";

const initialFilters: TeamFilters = {
  q: "",
  sport: "",
  position: "",
  ageGroup: "",
  level: "",
  gender: "",
  radius: null,
  deadline: "any",
  sort: "distance",
};

export function TeamsScreen() {
  const list = useListState();
  const [filters, setFilters] = useState<TeamFilters>(initialFilters);
  const [open, setOpen] = useState(false);
  useTitle("Find teams");

  const rows = useMemo(() => {
    const now = Date.now();
    const query = filters.q.trim().toLowerCase();
    const listRows = openings
      .map((opening) => ({ opening, team: teams.find((team) => team.id === opening.teamId)! }))
      .filter((row) => row.team)
      .filter((row) => {
        if (query) {
          const hay = `${row.team.name} ${row.team.city} ${row.team.sport} ${row.opening.position}`.toLowerCase();
          if (!hay.includes(query)) return false;
        }
        if (filters.sport && row.team.sport !== filters.sport) return false;
        if (filters.position && row.opening.position !== filters.position) return false;
        if (filters.ageGroup && row.team.ageGroup !== filters.ageGroup) return false;
        if (filters.level && row.team.level !== filters.level) return false;
        if (filters.gender && row.team.gender !== filters.gender) return false;
        if (filters.radius && row.team.distanceMiles > filters.radius) return false;
        const days = (new Date(row.opening.deadline).getTime() - now) / 86400000;
        if (filters.deadline === "14" && days > 14) return false;
        if (filters.deadline === "30" && days > 30) return false;
        return true;
      });
    listRows.sort((a, b) => {
      if (filters.sort === "spots") return b.opening.spots - a.opening.spots;
      if (filters.sort === "deadline") return a.opening.deadline.localeCompare(b.opening.deadline);
      return a.team.distanceMiles - b.team.distanceMiles;
    });
    return listRows;
  }, [filters]);

  const sports = [...new Set(teams.map((team) => team.sport))];
  const positions = [...new Set(openings.map((opening) => opening.position))];

  return (
    <Page
      title="Find teams"
      back={false}
      right={
        <button type="button" className="min-h-11 rounded-2xl px-2 text-sm font-semibold text-link" onClick={() => setOpen(true)}>
          Filters
        </button>
      }
    >
      <PullToRefresh onRefresh={list.refresh}>
        <SearchField value={filters.q} onChange={(q) => setFilters((current) => ({ ...current, q }))} placeholder="Team, city, or position" />
        <p className="mt-2 text-xs text-muted-foreground">Distances are sample miles from Naperville, not live location.</p>
        <ChipRow className="mt-3">
          {(["distance", "deadline", "spots"] as const).map((sort) => (
            <Chip key={sort} selected={filters.sort === sort} onClick={() => setFilters((current) => ({ ...current, sort }))}>
              {sort === "distance" ? "Nearest" : sort === "deadline" ? "Deadline" : "Most spots"}
            </Chip>
          ))}
        </ChipRow>
        <div className="mt-4 space-y-3">
          {list.loading && <CardSkeleton />}
          {!list.loading && list.error && <ErrorState title="Teams didn’t load" body="Pull to refresh when you are back online." onRetry={list.refresh} />}
          {!list.loading && !list.error && rows.length === 0 && (
            <EmptyState title="No openings match" body="Clear a filter or try another sport." action="Reset filters" onAction={() => setFilters(initialFilters)} />
          )}
          {!list.loading && !list.error && rows.map((row) => <TeamCard key={row.opening.id} team={row.team} opening={row.opening} />)}
        </div>
      </PullToRefresh>
      <BottomSheet open={open} title="Filters" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <FilterGroup label="Sport" value={filters.sport} options={sports} onChange={(sport) => setFilters((current) => ({ ...current, sport }))} />
          <FilterGroup label="Position" value={filters.position} options={positions} onChange={(position) => setFilters((current) => ({ ...current, position }))} />
          <FilterGroup label="Age group" value={filters.ageGroup} options={["12U", "14U", "15U", "16U", "17U", "18U"]} onChange={(ageGroup) => setFilters((current) => ({ ...current, ageGroup }))} />
          <FilterGroup label="Level" value={filters.level} options={["Local travel", "Regional travel", "National travel"]} onChange={(level) => setFilters((current) => ({ ...current, level }))} />
          <FilterGroup label="Gender" value={filters.gender} options={["Girls", "Boys", "Coed"]} onChange={(gender) => setFilters((current) => ({ ...current, gender }))} />
          <FilterGroup label="Within" value={filters.radius ? String(filters.radius) : ""} options={["50", "150", "300"]} onChange={(radius) => setFilters((current) => ({ ...current, radius: radius ? Number(radius) : null }))} />
          <FilterGroup label="Deadline" value={filters.deadline === "any" ? "" : filters.deadline} options={["14", "30"]} onChange={(deadline) => setFilters((current) => ({ ...current, deadline: (deadline || "any") as TeamFilters["deadline"] }))} />
          <Btn full onClick={() => setOpen(false)}>Show results</Btn>
        </div>
      </BottomSheet>
    </Page>
  );
}

function FilterGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Chip selected={!value} onClick={() => onChange("")}>Any</Chip>
        {options.map((option) => (
          <Chip key={option} selected={value === option} onClick={() => onChange(option)}>
            {option === "14" ? "14 days" : option === "30" ? "30 days" : option === "50" ? "50 mi" : option === "150" ? "150 mi" : option === "300" ? "300 mi" : option}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function TeamDetailScreen({ teamId }: { teamId: string }) {
  const team = teams.find((item) => item.id === teamId);
  const coach = coaches.find((item) => item.id === team?.coachId);
  const spots = openings.filter((item) => item.teamId === teamId);
  const { savedTeamIds, toggleSaved, athlete } = useApp();
  const navigate = useNavigate();
  useTitle(team?.name ?? "Team");
  if (!team) return <Page title="Team"><EmptyState title="Team not found" body="That sample team is not in the catalog." to="/teams" action="Back to teams" /></Page>;
  const saved = savedTeamIds.includes(team.id);

  return (
    <div className="min-h-dvh">
      <div className="relative">
        <img src={teamCover(team.id)} alt="" className="h-56 w-full object-cover" />
        <div className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))]">
          <IconButton label="Back" onClick={() => navigate({ to: "/teams" })} className="bg-background/90">
            <span aria-hidden>←</span>
          </IconButton>
        </div>
      </div>
      <div className="space-y-5 px-5 py-5 pb-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.sport} · {team.ageGroup} · {team.gender} · {team.level}</p>
          </div>
          <div className="flex gap-2">
            <IconButton label={saved ? "Remove saved team" : "Save team"} onClick={() => { toggleSaved(team.id); toast(saved ? "Removed from saved" : "Saved on this device"); }}>
              <Heart size={18} className={saved ? "fill-primary text-primary" : ""} />
            </IconButton>
            <IconButton
              label="Share team"
              onClick={async () => {
                const result = await shareOrCopy(team.name, `${team.name} · ${team.city}, ${team.state} · sample listing on SpotMyRoster`);
                if (result === "copied") toast("Team details copied");
              }}
            >
              <Share2 size={18} />
            </IconButton>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{team.about}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">Home field</p>
            <p className="font-semibold">{team.homeField}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">Sample distance</p>
            <p className="font-semibold">{team.distanceMiles} miles</p>
          </div>
        </div>
        <a className="inline-flex min-h-11 items-center text-sm font-semibold text-link" href={mapsUrl(team.address)} target="_blank" rel="noreferrer">
          Directions to {team.city}
        </a>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {team.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Open roster spots</h2>
          <div className="space-y-3">
            {spots.map((spot) => (
              <div key={spot.id} className="rounded-3xl bg-card p-4 ring-1 ring-border">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{spot.position}</p>
                  <Badge className="bg-primary text-primary-foreground">{spot.spots} open</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Deadline {formatShort(spot.deadline)}</p>
                <p className="mt-2 text-sm leading-relaxed">{spot.notes}</p>
                <Btn className="mt-3" full onClick={() => navigate({ to: "/apply/$openingId", params: { openingId: spot.id } })}>
                  Apply as {athlete?.firstName}
                </Btn>
              </div>
            ))}
          </div>
        </section>
        {coach && (
          <Link to="/coaches/$coachId" params={{ coachId: coach.id }} className="block rounded-3xl bg-card p-4 ring-1 ring-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coach</p>
            <p className="mt-1 font-semibold">{coach.name}</p>
            <p className="text-sm text-muted-foreground">{coach.city}, {coach.state}</p>
          </Link>
        )}
      </div>
    </div>
  );
}

export function CoachScreen({ coachId }: { coachId: string }) {
  const coach = coaches.find((item) => item.id === coachId);
  const { startConversation, athlete, blockedCoachIds } = useApp();
  const navigate = useNavigate();
  useTitle(coach?.name ?? "Coach");
  if (!coach) return <Page title="Coach"><EmptyState title="Coach not found" body="That sample profile is not available." to="/teams" action="Browse teams" /></Page>;
  const blocked = blockedCoachIds.includes(coach.id);
  const roster = teams.filter((team) => coach.teamIds.includes(team.id));

  return (
    <Page title="Coach">
      <h1 className="font-display text-[1.75rem] font-semibold">{coach.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{coach.city}, {coach.state} · {coach.years} years coaching (sample)</p>
      <p className="mt-4 text-sm leading-relaxed">{coach.bio}</p>
      <div className="mt-4 rounded-2xl bg-card p-4 text-sm ring-1 ring-border">
        <p className="font-semibold">Certifications</p>
        <p className="mt-1 text-muted-foreground">None listed. This sample does not invent credentials.</p>
      </div>
      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Teams</h2>
      <div className="space-y-3">
        {roster.map((team) => (
          <Link key={team.id} to="/teams/$teamId" params={{ teamId: team.id }} className="block rounded-2xl bg-card p-4 ring-1 ring-border">
            <p className="font-semibold">{team.name}</p>
            <p className="text-sm text-muted-foreground">{team.sport} · {team.ageGroup}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <Btn
          full
          disabled={blocked || athlete?.whoCanMessage === "none"}
          onClick={() => {
            const id = startConversation(coach.id);
            if (id) navigate({ to: "/chat/$conversationId", params: { conversationId: id } });
          }}
        >
          {blocked ? "Blocked" : athlete?.whoCanMessage === "none" ? "Messaging is off for this athlete" : "Message"}
        </Btn>
      </div>
    </Page>
  );
}

export function ApplyScreen({ openingId }: { openingId: string }) {
  const opening = openings.find((item) => item.id === openingId);
  const team = teams.find((item) => item.id === opening?.teamId);
  const { athlete, athletes, account, applications, setActiveAthlete, apply } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState(() =>
    athlete
      ? `${athlete.firstName} ${athlete.lastName} · ${athlete.positions.join(" / ") || athlete.sports.join(", ") || "Athlete"} · ${athlete.city}, ${athlete.state}. ${athlete.bio}`.trim()
      : "",
  );
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState("");
  useTitle("Apply");

  if (!opening || !team || !athlete || !account) {
    return <Page title="Apply"><EmptyState title="Opening unavailable" body="That roster spot is not in the sample catalog." to="/teams" action="Browse teams" /></Page>;
  }

  const existing = applications.find((item) => item.openingId === opening.id && item.athleteId === athlete.id && item.status !== "withdrawn");
  const managed = athletes.filter((item) => account.athleteIds.includes(item.id));

  const submit = () => {
    const id = apply({ openingId: opening.id, teamId: team.id, position: opening.position, message, attachmentName: fileName || undefined });
    setDone(id);
  };

  if (done) {
    return (
      <Page title="Application sent" back={false}>
        <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <h1 className="font-display text-2xl font-semibold">Submitted</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {athlete.firstName}’s {opening.position} application to {team.name} is saved on this device with status Submitted.
          </p>
          <Btn className="mt-5" full onClick={() => navigate({ to: "/applications/$applicationId", params: { applicationId: done } })}>
            View application
          </Btn>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Apply">
      <h1 className="font-display text-[1.7rem] font-semibold leading-tight">{team.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{opening.position} · {opening.spots} spots · due {formatShort(opening.deadline)}</p>
      {existing ? (
        <div className="mt-5">
          <EmptyState title="Already applied" body="This athlete already has an open application for the spot." action="View it" onAction={() => navigate({ to: "/applications/$applicationId", params: { applicationId: existing.id } })} />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {account.role === "parent" && (
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold">Athlete</span>
              <select
                className="min-h-12 w-full rounded-2xl bg-elevated px-3 ring-1 ring-border"
                value={athlete.id}
                onChange={(event) => setActiveAthlete(event.target.value)}
              >
                {managed.map((item) => (
                  <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>
                ))}
              </select>
            </label>
          )}
          <p className="text-sm"><span className="font-semibold">Position.</span> {opening.position}</p>
          <label className="block">
            <span className="mb-1.5 block text-[0.8125rem] font-semibold">Message to the coach</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-32 w-full rounded-2xl bg-elevated px-3 py-3 text-base ring-1 ring-border" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold">Highlight or document</span>
            <input
              type="file"
              accept="video/*,image/*,.pdf"
              className="block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setProgress(15);
                const timer = window.setInterval(() => {
                  setProgress((value) => {
                    if (value >= 100) {
                      window.clearInterval(timer);
                      return 100;
                    }
                    return value + 20;
                  });
                }, 180);
                setFileName(file.name);
              }}
            />
            {fileName && <span className="mt-2 block text-muted-foreground">{fileName}</span>}
            {progress > 0 && progress < 100 && <span className="mt-2 block text-xs">Attaching… {progress}%</span>}
          </label>
          <Btn full onClick={submit}>Submit application</Btn>
        </div>
      )}
    </Page>
  );
}
