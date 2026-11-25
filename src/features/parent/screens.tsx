import { Link, useNavigate } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parentPlan, statSports, tournaments, trainings } from "@/lib/parent-catalog";
import { teams } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { isPremium, setPremium } from "@/lib/premium";
import { readJson, writeJson } from "@/lib/storage";
import { statusLabel } from "@/lib/format";
import { Btn, Chip, ChipRow, EmptyState, Page, TextArea, TextField } from "@/components/athlete/ui";

const INQUIRY_KEY = "smr-inquiries";

type Inquiry = { id: string; title: string; detail: string; status: string };

export function DiscoverScreen() {
  const sports = ["Baseball", "Softball", "Basketball", "Soccer", "Volleyball"];
  return (
    <Page title="Everything open near you">
      <p className="text-sm leading-relaxed">Browse by sport or scan the latest listings within 15 miles of Oakland.</p>
      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Sports</h2>
      <div className="grid grid-cols-2 gap-2">
        {sports.map((sport) => (
          <Link key={sport} to="/teams" className="flex min-h-16 items-center rounded-3xl bg-card px-4 font-semibold ring-1 ring-border">
            {sport}
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Find a team</h2>
      <div className="space-y-3">
        {[
          ["Northstar United", "Soccer", "U14", "Boys", "Bellevue, WA", "Roster opening"],
          ["Lake Union Juniors", "Girls", "Seattle, WA", "Featured"],
          ["Rain City Select", "Co-ed", "Featured"],
        ].map((row) => (
          <Link key={row[0]} to="/teams" className="block rounded-3xl bg-card p-4 ring-1 ring-border">
            <p className="font-display text-lg font-semibold">{row[0]}</p>
            <p className="mt-1 text-sm text-muted-foreground">{row.slice(1).join(" · ")}</p>
          </Link>
        ))}
      </div>
      <Link to="/subscription" className="mt-4 block rounded-3xl bg-[#162830] p-4 text-white">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#00E5FF]"><Zap size={14} /> Premium Plan</p>
        <p className="mt-1 font-display text-lg font-semibold">Unlock Parent & Athlete Premium</p>
        <p className="mt-1 text-sm text-white/75">$9.99 yearly</p>
      </Link>
    </Page>
  );
}

export function OpportunitiesScreen() {
  const { athlete, applications } = useApp();
  const inquiries = readJson<Inquiry[]>(INQUIRY_KEY) ?? [];
  const mine = applications.filter((item) => item.athleteId === athlete?.id);
  return (
    <Page title="Registrations & inquiries">
      <p className="mb-4 text-sm leading-relaxed">Everything you've applied to or asked about, with the latest status from each organizer.</p>
      {mine.length === 0 && inquiries.length === 0 ? (
        <EmptyState title="No opportunities yet" body="Apply to a roster spot or send an inquiry from a tournament." to="/teams" action="Find a team" />
      ) : (
        <div className="space-y-3">
          {mine.map((item) => {
            const team = teams.find((row) => row.id === item.teamId);
            return (
              <Link key={item.id} to="/applications/$applicationId" params={{ applicationId: item.id }} className="block rounded-3xl bg-card p-4 ring-1 ring-border">
                <p className="font-semibold">{team?.name ?? "Team"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.position} · {statusLabel(item.status)}</p>
              </Link>
            );
          })}
          {inquiries.map((item) => (
            <div key={item.id} className="rounded-3xl bg-card p-4 ring-1 ring-border">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail} · {item.status}</p>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function TrainingsScreen() {
  return (
    <Page title="Available trainings">
      <p className="text-sm">Search by sport, skill, coach, or location</p>
      <p className="mt-1 text-sm text-muted-foreground">near Oakland, CA</p>
      <p className="mt-1 text-sm font-semibold">{trainings.length} trainings</p>
      <div className="mt-4 space-y-3">
        {trainings.map((item) => (
          <Link key={item.id} to="/trainings/$trainingId" params={{ trainingId: item.id }} className="block rounded-3xl bg-card p-4 ring-1 ring-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.kind} · {item.sport}</p>
            <p className="mt-1 font-display text-lg font-semibold leading-tight">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.place}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function TrainingDetailScreen({ trainingId }: { trainingId: string }) {
  const training = trainings.find((item) => item.id === trainingId);
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  if (!training) return <Page title="Training"><EmptyState title="Training not found" body="That camp is not in the list." to="/trainings" action="All trainings" /></Page>;
  return (
    <Page title="Training">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{training.kind} · {training.sport}</p>
      <h1 className="mt-1 font-display text-[1.7rem] font-semibold leading-tight">{training.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{training.place}</p>
      <p className="mt-4 text-sm leading-relaxed">{training.summary}</p>
      <form
        className="mt-5 space-y-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const list = readJson<Inquiry[]>(INQUIRY_KEY) ?? [];
          writeJson(INQUIRY_KEY, [...list, { id: `inq-${Date.now()}`, title: training.title, detail: training.place, status: "Inquiry sent" }]);
          toast("Inquiry saved on this device");
          navigate({ to: "/opportunities" });
        }}
      >
        <TextArea label="Note to the organizer" value={note} onChange={(event) => setNote(event.target.value)} />
        <Btn type="submit" full>Ask about this training</Btn>
      </form>
    </Page>
  );
}

export function TournamentsScreen() {
  return (
    <Page title="Tournaments">
      <p className="text-sm leading-relaxed text-muted-foreground">The next big weekend starts with a good plan. Confirm entry requirements with the organizer.</p>
      <div className="mt-4 space-y-3">
        {tournaments.map((item) => (
          <Link key={item.id} to="/tournaments/$tournamentId" params={{ tournamentId: item.id }} className="block rounded-3xl bg-card p-4 ring-1 ring-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.sport}</p>
            <p className="mt-1 font-display text-lg font-semibold leading-tight">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.dates} · {item.place}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function TournamentDetailScreen({ tournamentId }: { tournamentId: string }) {
  const event = tournaments.find((item) => item.id === tournamentId);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  if (!event) return <Page title="Tournament"><EmptyState title="Tournament not found" body="Go back to the list." to="/tournaments" action="Tournaments" /></Page>;
  return (
    <Page title="Tournament">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{event.sport}</p>
      <h1 className="mt-1 font-display text-[1.7rem] font-semibold leading-tight">{event.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{event.dates}</p>
      <p className="mt-1 text-sm">{event.venue} · {event.place}</p>
      <p className="mt-4 text-sm leading-relaxed">{event.summary}</p>
      <form
        className="mt-5 space-y-3"
        noValidate
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          const list = readJson<Inquiry[]>(INQUIRY_KEY) ?? [];
          writeJson(INQUIRY_KEY, [...list, { id: `inq-${Date.now()}`, title: event.title, detail: message.trim() || event.place, status: "Inquiry sent" }]);
          toast("Inquiry saved on this device");
          navigate({ to: "/opportunities" });
        }}
      >
        <TextArea label="Message to the organizer" value={message} onChange={(input) => setMessage(input.target.value)} />
        <p className="text-xs text-muted-foreground">Your contact details are not shown publicly. This preview does not send the message to an organizer.</p>
        <Btn type="submit" full>Send an inquiry</Btn>
      </form>
    </Page>
  );
}

const compareRows = [
  ["Browse teams, tryouts, and camps", true, true],
  ["Athlete profile", true, true],
  ["Save listings and send inquiries", true, true],
  ["Messages with organizers", false, true],
  ["Notifications", false, true],
  ["Highlighted athlete profile", false, true],
  ["Up to 3 athlete profiles", false, true],
  ["Email and text alerts", false, true],
] as const;

function usePlan() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(isPremium());
  }, []);
  return active;
}

export function SubscriptionScreen() {
  const active = usePlan();
  return (
    <Page title="Subscription">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Current plan</p>
      <div className="mt-2 rounded-3xl bg-card p-5 ring-1 ring-border">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl font-semibold uppercase leading-tight">{active ? parentPlan.name : "Free"}</p>
          <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase text-primary-foreground">Current</span>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold">{active ? parentPlan.price : "Free"}</p>
        <p className="text-sm text-muted-foreground">{active ? "Billed yearly. Nothing was charged in this preview." : "Parent account. Upgrade when you want messages and alerts."}</p>
      </div>
      <h2 className="mb-2 mt-5 font-display text-sm font-semibold uppercase tracking-wide">Included now</h2>
      <ul className="space-y-2">
        {compareRows.filter((row) => (active ? row[2] : row[1])).map((row) => (
          <li key={row[0]} className="rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border">{row[0]}</li>
        ))}
      </ul>
      <div className="mt-5 grid gap-2">
        <Link to="/subscription/compare" className="flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Compare plans
        </Link>
        {active ? (
          <Link to="/subscription/manage" className="flex min-h-11 items-center justify-center rounded-full bg-elevated px-4 text-sm font-semibold ring-1 ring-border">
            Manage plan
          </Link>
        ) : (
          <Link to="/subscription/upgrade" className="flex min-h-11 items-center justify-center rounded-full bg-elevated px-4 text-sm font-semibold ring-1 ring-border">
            Upgrade to Parent Premium
          </Link>
        )}
      </div>
    </Page>
  );
}

export function ComparePlansScreen() {
  const active = usePlan();
  const [choice, setChoice] = useState<"free" | "premium">("premium");
  useEffect(() => {
    setChoice(active ? "premium" : "free");
  }, [active]);
  return (
    <Page title="Compare plans">
      <p className="text-sm text-muted-foreground">Free and Parent & Athlete Premium are the two plans in this account.</p>
      <div className="mt-4 grid gap-2">
        <PlanChoice
          selected={choice === "free"}
          current={active === false}
          name="Free"
          price="Free"
          detail="Parent account"
          onClick={() => setChoice("free")}
        />
        <PlanChoice
          selected={choice === "premium"}
          current={active}
          name={parentPlan.name}
          price={parentPlan.price}
          detail="Yearly"
          onClick={() => setChoice("premium")}
        />
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
        <div className="grid grid-cols-[1fr_3.25rem_4.5rem] gap-2 border-b border-border px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Feature</span>
          <span className="text-center">Free</span>
          <span className="text-center">Premium</span>
        </div>
        {compareRows.map((row) => (
          <div key={row[0]} className="grid grid-cols-[1fr_3.25rem_4.5rem] items-center gap-2 border-b border-border px-3 py-3 text-sm last:border-b-0">
            <span>{row[0]}</span>
            <Mark on={row[1]} />
            <Mark on={row[2]} />
          </div>
        ))}
      </div>
      <div className="mt-5">
        {choice === "premium" && !active && (
          <Link to="/subscription/upgrade" className="flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Continue with Premium
          </Link>
        )}
        {choice === "premium" && active && (
          <Link to="/subscription" className="flex min-h-11 items-center justify-center rounded-full bg-elevated px-4 text-sm font-semibold ring-1 ring-border">
            You’re on Premium
          </Link>
        )}
        {choice === "free" && active && (
          <Link to="/subscription/manage" className="flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Switch to Free
          </Link>
        )}
        {choice === "free" && !active && (
          <Link to="/subscription" className="flex min-h-11 items-center justify-center rounded-full bg-elevated px-4 text-sm font-semibold ring-1 ring-border">
            You’re on Free
          </Link>
        )}
      </div>
    </Page>
  );
}

function PlanChoice({ selected, current, name, price, detail, onClick }: { selected: boolean; current: boolean; name: string; price: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-3xl p-4 text-left ring-1 ${selected ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border"}`}>
      <span className="flex items-center justify-between gap-2">
        <span className="font-display text-lg font-semibold uppercase leading-tight">{name}</span>
        {current && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${selected ? "bg-background text-foreground" : "bg-primary text-primary-foreground"}`}>Current</span>}
      </span>
      <span className="mt-2 block font-display text-2xl font-semibold">{price}</span>
      <span className={`mt-1 block text-sm ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{detail}</span>
    </button>
  );
}

function Mark({ on }: { on: boolean }) {
  return <span className={`text-center text-sm font-semibold ${on ? "text-primary" : "text-muted-foreground"}`}>{on ? "Yes" : "—"}</span>;
}

export function ManagePlanScreen() {
  const navigate = useNavigate();
  const active = usePlan();
  return (
    <Page title="Manage plan">
      <h1 className="font-display text-[1.7rem] font-semibold uppercase leading-tight">{active ? parentPlan.name : "Free"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {active
          ? "Turning Premium off keeps the parent account and removes messages and notifications on this device. No refund is processed because no card was charged."
          : "This account is already on the Free plan."}
      </p>
      {active ? (
        <Btn
          className="mt-5"
          full
          variant="danger"
          onClick={() => {
            setPremium(false);
            toast("Switched to the Free plan on this device");
            navigate({ to: "/subscription" });
          }}
        >
          Switch to Free
        </Btn>
      ) : (
        <Link to="/subscription/compare" className="mt-5 flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Compare plans
        </Link>
      )}
    </Page>
  );
}

export function UpgradeScreen() {
  const { account } = useApp();
  const name = account ? `${account.firstName} ${account.lastName}`.trim() : "this account";
  return (
    <Page title="Upgrade">
      <h1 className="font-display text-[1.7rem] font-semibold leading-tight">Upgrade to Parent Premium</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">You are upgrading {name || "Jordan Davis"} (Parent Account) to a Premium Athlete Membership.</p>
      <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>Parent Premium, 1 year</span>
          <span className="font-semibold">{parentPlan.price}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{parentPlan.price}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Billed annually in the design. This preview does not charge a card.</p>
      </div>
      <div className="mt-4 grid gap-2">
        <Link to="/subscription/payment" className="flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Continue to payment</Link>
        <Link to="/subscription" className="flex min-h-11 items-center justify-center rounded-2xl bg-elevated px-4 text-sm font-semibold ring-1 ring-border">Cancel and return</Link>
      </div>
    </Page>
  );
}

export function PaymentScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  return (
    <Page title="Payment">
      <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
        <p className="text-sm text-muted-foreground">Parent Premium subscription</p>
        <p className="mt-1 font-display text-2xl font-semibold">{parentPlan.price}</p>
      </div>
      <form
        className="mt-4 space-y-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setPremium(true);
          setCard("");
          toast("Membership marked active on this device");
          navigate({ to: "/subscription/success", replace: true });
        }}
      >
        <TextField label="Name on card" value={name} onChange={(event) => setName(event.target.value)} autoComplete="cc-name" />
        <TextField label="Card number" value={card} onChange={(event) => setCard(event.target.value)} autoComplete="off" inputMode="numeric" />
        <TextField label="Expiry" value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="MM / YY" autoComplete="off" />
        <p className="text-xs leading-relaxed text-muted-foreground">No card number is saved, and nothing is sent to a payment processor. The {parentPlan.price} yearly price is the plan from the athlete design.</p>
        <Btn type="submit" full>Confirm membership</Btn>
      </form>
    </Page>
  );
}

export function PaymentSuccessScreen() {
  return (
    <Page title="You’re in" back={false}>
      <div className="rounded-3xl bg-[#162830] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#00E5FF]">Parent Premium</p>
        <h1 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight">Your premium benefits are active on this device.</h1>
        <p className="mt-2 text-sm text-white/75">Discovery, a highlighted profile, and organizer messages are unlocked in this preview. No charge was made.</p>
      </div>
      <div className="mt-4 grid gap-2">
        <Link to="/subscription" className="flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">View current plan</Link>
        <Link to="/home" className="flex min-h-11 items-center justify-center rounded-full bg-elevated px-4 text-sm font-semibold ring-1 ring-border">Go to home</Link>
      </div>
    </Page>
  );
}

export function StatsScreen() {
  const { athlete } = useApp();
  const [sport, setSport] = useState(athlete?.sports[0] || "Baseball");
  const sheet = statSports.find((item) => item.sport === sport) ?? statSports[0];
  const known = new Map((athlete?.measurables ?? []).map((item) => [item.label.toLowerCase(), item.value]));
  return (
    <Page title="Stats">
      <p className="text-sm text-muted-foreground">Sport-specific numbers for {athlete ? `${athlete.firstName} ${athlete.lastName}` : "this athlete"}. Only numbers already on the profile are filled in.</p>
      <ChipRow className="mt-4">
        {statSports.map((item) => (
          <Chip key={item.sport} selected={sheet.sport === item.sport} onClick={() => setSport(item.sport)}>{item.sport}</Chip>
        ))}
      </ChipRow>
      <div className="mt-4 space-y-4">
        {sheet.groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 font-display text-lg font-semibold">{group.title}</h2>
            <ul className="space-y-2">
              {group.items.map((label) => {
                const value = [...known.entries()].find(([key]) => key.includes(label.toLowerCase()))?.[1];
                return (
                  <li key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border">
                    <span>{label}</span>
                    <span className="font-semibold">{value || "Not added"}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <Link to="/profile/edit" className="mt-4 flex min-h-11 items-center justify-center rounded-2xl bg-elevated px-4 text-sm font-semibold ring-1 ring-border">Edit athlete</Link>
    </Page>
  );
}

export function EmmaProfileScreen() {
  return (
    <Page title="Emma Davis">
      <h1 className="font-display text-[1.7rem] font-semibold leading-tight">Emma Davis</h1>
      <p className="mt-2 text-sm">Emma Davis U14</p>
      <p className="mt-1 text-sm">Baseball</p>
      <p className="mt-1 text-sm">Charlotte, NC</p>
      <p className="mt-3 inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">92% Match</p>
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold">Parent / guardian</h2>
      <p className="text-sm">Sarah Davis</p>
      <p className="mt-2 text-sm text-muted-foreground">Contact details are shared once the parent replies.</p>
    </Page>
  );
}
