import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Facebook, Instagram, Plus, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import swing from "@/assets/images/sports/softball-camp.jpg";
import field from "@/assets/images/sports/softball.jpg";
import pitch from "@/assets/images/sports/pitching-lessons.jpg";
import { loadAthletes, saveAthletes, sheetsFor, type AthleteProfile } from "@/lib/my-athlete";
import { useTitle } from "@/components/athlete/ui";

const photos: Record<string, string> = { swing, field, pitch };

function useAthletes() {
  const [saved, setSaved] = useState(loadAthletes);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setSaved(loadAthletes());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) saveAthletes(saved);
  }, [saved, ready]);
  const active = saved.athletes.find((item) => item.id === saved.activeId) ?? saved.athletes[0];
  function update(partial: Partial<AthleteProfile>) {
    setSaved((current) => ({
      ...current,
      athletes: current.athletes.map((item) => (item.id === current.activeId ? { ...item, ...partial } : item)),
    }));
  }
  function add(profile: AthleteProfile) {
    setSaved((current) => ({ activeId: profile.id, athletes: [...current.athletes, profile] }));
  }
  function select(id: string) {
    setSaved((current) => ({ ...current, activeId: id }));
  }
  return { active, athletes: saved.athletes, update, add, select };
}

function BackButton({ to }: { to: "/home" | "/profile" }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : navigate({ to }))}
      className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground"
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}

function highlightSrc(item: { id: string; src?: string }) {
  return item.src || photos[item.id] || field;
}

export function MyAthleteScreen() {
  const { active, athletes, update, select } = useAthletes();
  const sheets = sheetsFor(active.sport);
  useTitle("My Athlete");
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <div className="flex items-start justify-between gap-3">
        <div>
          <BackButton to="/home" />
          <h1 className="font-display text-[2rem] font-semibold uppercase leading-none">{active.firstName} {active.lastName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Keep this profile current — organizers see it when you register or inquire.</p>
        </div>
        <Link to="/profile/add" className="mt-2 inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-elevated px-3 text-xs font-semibold ring-1 ring-border">
          <Plus size={14} /> Add Athlete
        </Link>
      </div>

      {athletes.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {athletes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              className={`h-9 shrink-0 rounded-full px-3 text-xs font-semibold ${item.id === active.id ? "bg-primary text-primary-foreground" : "bg-elevated"}`}
            >
              {item.firstName}
            </button>
          ))}
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
        <div className="relative">
          <img src={highlightSrc(active.highlights[0] ?? { id: "field" })} alt="" className="h-56 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
            <p className="font-display text-xl font-semibold uppercase">{active.firstName} {active.lastName}</p>
            <p className="text-sm text-white/80">{active.ageGroup} · {active.sport}</p>
          </div>
        </div>
        <div className="p-3">
          <Link to="/profile/edit" className="flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            Edit athlete
          </Link>
        </div>
      </section>

      <section className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Contact & social</h2>
        <div className="mt-3 space-y-2">
          <a href={`https://facebook.com/${active.facebook.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-elevated px-3 py-3 text-sm">
            <Facebook size={16} className="text-primary" />
            <span><span className="block text-xs text-muted-foreground">Facebook</span>{active.facebook}</span>
          </a>
          <a href={`https://instagram.com/${active.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-elevated px-3 py-3 text-sm">
            <Instagram size={16} className="text-primary" />
            <span><span className="block text-xs text-muted-foreground">Instagram</span>{active.instagram}</span>
          </a>
          <Link to="/profile/recruiting" className="flex items-center gap-3 rounded-2xl bg-elevated px-3 py-3 text-sm">
            <Trophy size={16} className="text-primary" />
            <span><span className="block text-xs text-muted-foreground">Recruiting profile</span>/{active.recruiting}</span>
          </Link>
        </div>
      </section>

      <section className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Profile</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
          <Fact label="Age group" value={active.ageGroup} />
          <Fact label="Primary sport" value={active.sport} />
          <Fact label="Positions" value={active.positions} />
          <Fact label="School" value={active.school} />
          <Fact label="Bats" value={active.bats} />
          <Fact label="Throws" value={active.throws} />
          <Fact label="Height" value={active.height} />
          <Fact label="GPA" value={active.gpa} />
        </dl>
      </section>

      <section className="mt-3 flex items-center justify-between gap-3 rounded-3xl bg-card p-4 ring-1 ring-border">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Looking to sub</h2>
          <p className="mt-1 text-sm text-muted-foreground">I am available as a substitute player for coaching matches.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active.lookingToSub}
          onClick={() => update({ lookingToSub: !active.lookingToSub })}
          className={`relative h-7 w-12 shrink-0 rounded-full ${active.lookingToSub ? "bg-primary" : "bg-elevated ring-1 ring-border"}`}
        >
          <span className={`absolute top-0.5 size-6 rounded-full bg-background transition ${active.lookingToSub ? "left-5" : "left-0.5"}`} />
        </button>
      </section>

      <StatsBlock sport={active.sport} sheets={sheets} activeId={sheets[0]?.id ?? "batting"} />

      <section className="mt-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Video / photo highlights</h2>
          <Link to="/profile/media" className="text-xs font-semibold text-primary">+ Add Media</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {active.highlights.map((item) => (
            <img key={item.id} src={highlightSrc(item)} alt={item.name} className="h-28 w-36 shrink-0 rounded-2xl object-cover" />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatsBlock({ sport, sheets, activeId }: { sport: string; sheets: ReturnType<typeof sheetsFor>; activeId: string }) {
  const current = sheets.find((item) => item.id === activeId) ?? sheets[0];
  if (!current) return null;
  return (
    <section className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Stats ({sport})</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {sheets.map((item) => (
          <Link
            key={item.id}
            to="/profile/stats"
            search={{ sheet: item.id }}
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${item.id === current.id ? "bg-primary text-primary-foreground" : "bg-elevated"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-4 gap-2">
        {current.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-elevated px-2 py-3 text-center">
            <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-sm font-semibold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold uppercase leading-snug">{value}</dd>
    </div>
  );
}

export function AthleteStatsScreen({ sheet }: { sheet: string }) {
  const { active } = useAthletes();
  const sheets = sheetsFor(active.sport);
  const current = sheets.find((item) => item.id === sheet) ?? sheets[0];
  useTitle(current?.label ?? "Stats");
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/profile" />
      <h1 className="mt-2 font-display text-[1.7rem] font-semibold uppercase leading-none">{active.firstName} {active.lastName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{active.ageGroup} · {active.sport} · {active.positions}</p>
      <section className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Stats ({active.sport})</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {sheets.map((item) => (
            <Link
              key={item.id}
              to="/profile/stats"
              search={{ sheet: item.id }}
              className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${item.id === current?.id ? "bg-primary text-primary-foreground" : "bg-elevated"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          {(current?.stats ?? []).map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-elevated px-3 py-4">
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function EditAthleteScreen() {
  const { active, update } = useAthletes();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(active);
  useTitle("Edit athlete");
  useEffect(() => {
    setDraft(active);
  }, [active]);
  const set = (key: keyof AthleteProfile, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/profile" />
      <h1 className="mt-2 font-display text-[1.7rem] font-semibold uppercase">Edit athlete</h1>
      <form
        className="mt-4 space-y-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          update(draft);
          toast("Athlete profile saved on this device");
          navigate({ to: "/profile" });
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Field label="First name" value={draft.firstName} onChange={(value) => set("firstName", value)} />
          <Field label="Last name" value={draft.lastName} onChange={(value) => set("lastName", value)} />
        </div>
        <Field label="Age group" value={draft.ageGroup} onChange={(value) => set("ageGroup", value)} />
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Primary sport
          <select value={draft.sport} onChange={(event) => set("sport", event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-elevated px-3 text-sm font-medium text-foreground">
            {["Softball", "Baseball", "Soccer", "Basketball", "Football", "Volleyball", "Track and Field", "Lacrosse", "Ice Hockey"].map((sport) => (
              <option key={sport}>{sport}</option>
            ))}
          </select>
        </label>
        <Field label="Positions" value={draft.positions} onChange={(value) => set("positions", value)} />
        <Field label="School" value={draft.school} onChange={(value) => set("school", value)} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Bats" value={draft.bats} onChange={(value) => set("bats", value)} />
          <Field label="Throws" value={draft.throws} onChange={(value) => set("throws", value)} />
          <Field label="Height" value={draft.height} onChange={(value) => set("height", value)} />
          <Field label="GPA" value={draft.gpa} onChange={(value) => set("gpa", value)} />
        <Field label="Skill level" value={draft.skill} onChange={(value) => set("skill", value)} />
        </div>
        <Field label="Facebook" value={draft.facebook} onChange={(value) => set("facebook", value)} />
        <Field label="Instagram" value={draft.instagram} onChange={(value) => set("instagram", value)} />
        <Field label="Recruiting profile" value={draft.recruiting} onChange={(value) => set("recruiting", value)} />
        <button type="submit" className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">Save</button>
      </form>
    </div>
  );
}

export function AddAthleteScreen() {
  const { add } = useAthletes();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sport, setSport] = useState("Softball");
  const [position, setPosition] = useState("");
  const [secondary, setSecondary] = useState("");
  const [skill, setSkill] = useState("");
  const [ageGroup, setAgeGroup] = useState("U14");
  useTitle("Add athlete");
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/profile" />
      <h1 className="mt-2 font-display text-[1.7rem] font-semibold uppercase">Add athlete</h1>
      <p className="mt-2 text-sm text-muted-foreground">This profile is linked to Jordan’s parent account and stays on this device.</p>
      <form
        className="mt-4 space-y-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const profile: AthleteProfile = {
            ...loadAthletes().athletes[0],
            id: `athlete-${Date.now()}`,
            firstName: firstName || "Athlete",
            lastName,
            sport,
            positions: [position, secondary].filter(Boolean).join(" / ") || "Player",
            ageGroup,
            school: "",
            skill,
            highlights: [
              { id: "swing", name: "Swing" },
              { id: "field", name: "Infield" },
              { id: "pitch", name: "Pitching" },
            ],
          };
          add(profile);
          toast(`${profile.firstName} added on this device`);
          navigate({ to: "/profile" });
        }}
      >
        <Field label="Athlete first name" value={firstName} onChange={setFirstName} />
        <Field label="Athlete last name" value={lastName} onChange={setLastName} />
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Primary sport
          <select value={sport} onChange={(event) => setSport(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-elevated px-3 text-sm font-medium text-foreground">
            {["Softball", "Baseball", "Soccer", "Basketball", "Football", "Volleyball", "Track and Field", "Lacrosse", "Ice Hockey"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <Field label="Primary position" value={position} onChange={setPosition} />
        <Field label="Secondary position (optional)" value={secondary} onChange={setSecondary} />
        <Field label="Skill level" value={skill} onChange={setSkill} />
        <Field label="Age group" value={ageGroup} onChange={setAgeGroup} />
        <button type="submit" className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">Add athlete</button>
      </form>
    </div>
  );
}

export function AddMediaScreen() {
  const { active, update } = useAthletes();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  useTitle("Add media");
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/profile" />
      <h1 className="mt-2 font-display text-[1.7rem] font-semibold uppercase">Add media</h1>
      <p className="mt-2 text-sm text-muted-foreground">Photos and clips for {active.firstName} stay on this device.</p>
      <form
        className="mt-4 space-y-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const file = (event.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0];
          if (!file) {
            update({ highlights: [...active.highlights, { id: `clip-${Date.now()}`, name: name || "Highlight", src: photos.field }] });
            toast("Highlight added");
            navigate({ to: "/profile" });
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            update({
              highlights: [...active.highlights, { id: `clip-${Date.now()}`, name: name || file.name, src: typeof reader.result === "string" ? reader.result : photos.field }],
            });
            toast("Highlight added");
            navigate({ to: "/profile" });
          };
          reader.readAsDataURL(file);
        }}
      >
        <Field label="Title" value={name} onChange={setName} />
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Photo or video
          <input name="file" type="file" accept="image/*,video/*" className="mt-1 block w-full text-sm" />
        </label>
        <button type="submit" className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">Add to highlights</button>
      </form>
    </div>
  );
}

export function RecruitingScreen() {
  const { active } = useAthletes();
  useTitle("Recruiting profile");
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/profile" />
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-primary">Recruiting profile</p>
      <h1 className="mt-1 font-display text-[1.7rem] font-semibold uppercase leading-tight">{active.firstName} {active.lastName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">/{active.recruiting}</p>
      <section className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Fact label="Age group" value={active.ageGroup} />
          <Fact label="Sport" value={active.sport} />
          <Fact label="Position" value={active.positions} />
          <Fact label="School" value={active.school || "—"} />
          <Fact label="Bats / throws" value={`${active.bats} / ${active.throws}`} />
          <Fact label="Height" value={active.height} />
          <Fact label="GPA" value={active.gpa} />
          <Fact label="Looking to sub" value={active.lookingToSub ? "Yes" : "No"} />
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {active.firstName} is a {active.ageGroup} {active.sport.toLowerCase()} {active.positions.toLowerCase()} at {active.school || "school"}. Organizers see this profile when a parent registers or sends an inquiry.
        </p>
      </section>
      <Link to="/profile/stats" search={{ sheet: sheetsFor(active.sport)[0]?.id ?? "batting" }} className="mt-4 flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        View stats
      </Link>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-elevated px-3 text-sm font-medium normal-case text-foreground outline-none" />
    </label>
  );
}
