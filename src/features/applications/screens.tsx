import { useState } from "react";
import { toast } from "sonner";
import { openings, teams } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";
import { formatShort, formatWhen, statusClass, statusLabel } from "@/lib/format";
import { ApplicationRow, TeamCard } from "@/components/athlete/cards";
import { Badge, Btn, Chip, ChipRow, EmptyState, Page } from "@/components/athlete/ui";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const filters: Array<ApplicationStatus | "all"> = ["all", "submitted", "viewed", "shortlisted", "invited", "offered", "accepted", "declined", "withdrawn"];

export function ApplicationsScreen() {
  const { athlete, applications } = useApp();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  if (!athlete) return null;
  const mine = applications.filter((item) => item.athleteId === athlete.id && (filter === "all" || item.status === filter));

  return (
    <Page title="Applications">
      <ChipRow className="mb-4">
        {filters.map((item) => (
          <Chip key={item} selected={filter === item} onClick={() => setFilter(item)}>
            {item === "all" ? "All" : statusLabel(item)}
          </Chip>
        ))}
      </ChipRow>
      {mine.length === 0 ? (
        <EmptyState title="No applications" body="Apply to an open roster spot and the status will show up here." to="/teams" action="Find teams" />
      ) : (
        <div className="space-y-3">
          {mine.map((item) => <ApplicationRow key={item.id} application={item} />)}
        </div>
      )}
    </Page>
  );
}

export function ApplicationDetailScreen({ applicationId }: { applicationId: string }) {
  const { applications, withdraw, respond, athlete } = useApp();
  const [confirm, setConfirm] = useState(false);
  const application = applications.find((item) => item.id === applicationId && item.athleteId === athlete?.id);
  const team = teams.find((item) => item.id === application?.teamId);
  const opening = openings.find((item) => item.id === application?.openingId);
  if (!application || !team) {
    return <Page title="Application"><EmptyState title="Application not found" body="It may belong to another athlete profile." to="/applications" action="My applications" /></Page>;
  }
  const canRespond = application.status === "invited" || application.status === "offered";
  const canWithdraw = !["withdrawn", "accepted", "declined"].includes(application.status);

  return (
    <Page title="Application">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.7rem] font-semibold leading-tight">{team.name}</h1>
          <p className="text-sm text-muted-foreground">{application.position}{opening ? ` · due ${formatShort(opening.deadline)}` : ""}</p>
        </div>
        <Badge className={statusClass(application.status)}>{statusLabel(application.status)}</Badge>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{application.message}</p>
      {application.attachmentName && <p className="mt-2 text-sm text-muted-foreground">Attachment: {application.attachmentName}</p>}
      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Timeline</h2>
      <ol className="space-y-4 border-l border-border pl-4">
        {application.timeline.map((event) => (
          <li key={event.id}>
            <p className="font-semibold">{event.label}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(event.at)}</p>
          </li>
        ))}
      </ol>
      {canRespond && (
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Btn onClick={() => { respond(application.id, "accepted"); toast("Marked accepted on this device"); }}>Accept</Btn>
          <Btn variant="secondary" onClick={() => { respond(application.id, "declined"); toast("Marked declined on this device"); }}>Decline</Btn>
        </div>
      )}
      {canWithdraw && (
        <Btn variant="danger" full className="mt-3" onClick={() => setConfirm(true)}>Withdraw application</Btn>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this application?</AlertDialogTitle>
            <AlertDialogDescription>The status changes to Withdrawn in this sample. A coach is not notified because there is no live service.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => { withdraw(application.id); toast("Application withdrawn"); }}>Withdraw</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}

export function SavedScreen() {
  const { savedTeamIds } = useApp();
  const saved = teams.filter((team) => savedTeamIds.includes(team.id));
  return (
    <Page title="Saved teams">
      {saved.length === 0 ? (
        <EmptyState title="No saved teams" body="Save a team from its page and it will stay on this device." to="/teams" action="Find teams" />
      ) : (
        <div className="space-y-3">
          {saved.map((team) => {
            const opening = openings.find((item) => item.teamId === team.id);
            return <TeamCard key={team.id} team={team} opening={opening} />;
          })}
        </div>
      )}
    </Page>
  );
}
