import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AVAILABILITY, POSITIONS, SKILL_LEVELS, SPORTS, STATES } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Athlete } from "@/lib/types";
import { athleteName, completeness, isUnder13 } from "@/lib/format";
import { Avatar, Btn, Chip, Page, ProgressBar, SelectField, TextArea, TextField } from "@/components/athlete/ui";

export function ProfileScreen() {
  const { athlete, account } = useApp();
  if (!athlete || !account) return null;
  const score = completeness(athlete);
  return (
    <Page title="Profile" back={false} right={<Link to="/account" className="text-sm font-semibold text-link">Account</Link>}>
      <div className="flex items-center gap-4">
        <Avatar name={athleteName(athlete)} src={athlete.photoUrl} size={72} />
        <div>
          <h1 className="font-display text-2xl font-semibold">{athleteName(athlete)}</h1>
          <p className="text-sm text-muted-foreground">{athlete.city}, {athlete.state} · Class of {athlete.gradYear ?? "—"}</p>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={score} label="Profile strength" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to="/profile/preview" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-3 text-sm font-semibold text-primary-foreground">Preview</Link>
        <Link to="/profile/edit" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-elevated px-3 text-sm font-semibold ring-1 ring-border">Edit</Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Info label="Sports" value={athlete.sports.join(", ") || "—"} />
        <Info label="Positions" value={athlete.positions.join(", ") || "—"} />
        <Info label="Height" value={athlete.height || "—"} />
        <Info label="Weight" value={athlete.weight || "—"} />
        <Info label="Side" value={athlete.dominantSide || "—"} />
        <Info label="Level" value={athlete.skillLevel || "—"} />
      </div>
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold">Bio</h2>
      <p className="text-sm leading-relaxed">{athlete.bio || "No bio yet."}</p>
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold">Self-reported numbers</h2>
      {athlete.measurables.length === 0 ? <p className="text-sm text-muted-foreground">None added.</p> : (
        <ul className="space-y-2">
          {athlete.measurables.map((item) => (
            <li key={item.label} className="flex justify-between rounded-2xl bg-card px-3 py-3 text-sm ring-1 ring-border">
              <span>{item.label}</span><span className="font-semibold">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold">Highlights</h2>
      {athlete.media.length === 0 ? <p className="text-sm text-muted-foreground">No photos or clips yet.</p> : (
        <ul className="space-y-2">
          {athlete.media.map((item) => (
            <li key={item.id} className="rounded-2xl bg-card px-3 py-3 text-sm ring-1 ring-border">
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.kind}</p>
              {item.url && item.kind === "photo" && <img src={item.url} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />}
            </li>
          ))}
        </ul>
      )}
      <h2 className="mb-2 mt-6 font-display text-lg font-semibold">Past teams</h2>
      <ul className="space-y-2 text-sm">
        {athlete.pastTeams.map((team) => <li key={team.name}>{team.name} · {team.seasons}</li>)}
        {athlete.pastTeams.length === 0 && <li className="text-muted-foreground">None listed.</li>}
      </ul>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Visibility: {athlete.visibility}. Messaging: {athlete.whoCanMessage === "none" ? "off" : "coaches"}.
        {account.role === "parent" ? " A parent is managing this profile." : ""}
      </p>
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function EditProfileScreen() {
  const { athlete, updateAthlete } = useApp();
  const [draft, setDraft] = useState<Athlete | null>(athlete);
  const [measureLabel, setMeasureLabel] = useState("");
  const [measureValue, setMeasureValue] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  if (!athlete || !draft) return null;
  const patch = (partial: Partial<Athlete>) => setDraft({ ...draft, ...partial });
  const under13 = isUnder13(draft.birthYear);
  const positions = draft.sports.flatMap((sport) => POSITIONS[sport] ?? []);

  const save = () => {
    updateAthlete(athlete.id, {
      ...draft,
      whoCanMessage: under13 ? "none" : draft.whoCanMessage,
      visibility: under13 && draft.visibility === "coaches" ? "applied" : draft.visibility,
    });
    toast("Profile updated on this device");
  };

  return (
    <Page title="Edit profile">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" value={draft.firstName} onChange={(event) => patch({ firstName: event.target.value })} />
          <TextField label="Last name" value={draft.lastName} onChange={(event) => patch({ lastName: event.target.value })} />
        </div>
        <TextField label="City" value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
        <SelectField label="State" value={draft.state} onChange={(state) => patch({ state })} options={STATES.map((state) => ({ value: state, label: state }))} />
        <TextArea label="Bio" value={draft.bio} onChange={(event) => patch({ bio: event.target.value })} />
        <TextField label="Current team" value={draft.currentTeam} onChange={(event) => patch({ currentTeam: event.target.value })} />
        <TextField label="Height" value={draft.height} onChange={(event) => patch({ height: event.target.value })} />
        <TextField label="Weight" value={draft.weight} onChange={(event) => patch({ weight: event.target.value })} />
        <SelectField label="Skill" value={draft.skillLevel} onChange={(skillLevel) => patch({ skillLevel })} options={SKILL_LEVELS.map((level) => ({ value: level, label: level }))} />
        <p className="text-sm font-semibold">Sports</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <Chip key={sport} selected={draft.sports.includes(sport)} onClick={() => patch({ sports: draft.sports.includes(sport) ? draft.sports.filter((item) => item !== sport) : [...draft.sports, sport] })}>
              {sport}
            </Chip>
          ))}
        </div>
        <p className="text-sm font-semibold">Positions</p>
        <div className="flex flex-wrap gap-2">
          {positions.map((position) => (
            <Chip key={position} selected={draft.positions.includes(position)} onClick={() => patch({ positions: draft.positions.includes(position) ? draft.positions.filter((item) => item !== position) : [...draft.positions, position] })}>
              {position}
            </Chip>
          ))}
        </div>
        <p className="text-sm font-semibold">Availability</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY.map((item) => (
            <Chip key={item} selected={draft.availability.includes(item)} onClick={() => patch({ availability: draft.availability.includes(item) ? draft.availability.filter((value) => value !== item) : [...draft.availability, item] })}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Number label" value={measureLabel} onChange={(event) => setMeasureLabel(event.target.value)} />
          <TextField label="Value" value={measureValue} onChange={(event) => setMeasureValue(event.target.value)} />
        </div>
        <Btn variant="secondary" onClick={() => {
          patch({ measurables: [...draft.measurables, { label: `${measureLabel.trim()} (self-reported)`, value: measureValue.trim() }] });
          setMeasureLabel("");
          setMeasureValue("");
        }}>Add number</Btn>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold">Add a photo, video, or file</span>
          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setUploadError("");
              setUploadProgress(20);
              const finish = (url?: string) => {
                setUploadProgress(100);
                patch({
                  media: [...draft.media, { id: `media-${Date.now()}`, kind: file.type.startsWith("video") ? "video" : file.type.startsWith("image") ? "photo" : "file", name: file.name, url }],
                  photoUrl: file.type.startsWith("image") && url ? url : draft.photoUrl,
                });
              };
              if (file.type.startsWith("image") && file.size < 1_500_000) {
                const reader = new FileReader();
                reader.onload = () => finish(typeof reader.result === "string" ? reader.result : undefined);
                reader.onerror = () => setUploadError("That photo could not be read.");
                reader.readAsDataURL(file);
              } else {
                finish(URL.createObjectURL(file));
              }
            }}
          />
          {uploadProgress > 0 && uploadProgress < 100 && <span className="mt-1 block text-xs">Uploading on this device… {uploadProgress}%</span>}
          {uploadError && <span className="mt-1 block text-xs text-destructive">{uploadError}</span>}
        </label>
        <Btn full onClick={save}>Save profile</Btn>
      </div>
    </Page>
  );
}

export function PreviewScreen() {
  const { athlete } = useApp();
  if (!athlete) return null;
  const hidden = athlete.visibility === "private";
  const limited = athlete.visibility === "applied";
  return (
    <Page title="Coach view">
      <p className="mb-4 text-sm text-muted-foreground">This is the sample view of what a coach would see with the current visibility setting. Guardian phone numbers are not shown.</p>
      {hidden ? (
        <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <h1 className="font-display text-2xl font-semibold">Profile is private</h1>
          <p className="mt-2 text-sm leading-relaxed">Coaches cannot open this profile until a parent changes visibility.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <Avatar name={athleteName(athlete)} src={limited ? undefined : athlete.photoUrl} size={56} />
            <div>
              <h1 className="font-display text-xl font-semibold">{athlete.firstName} {athlete.lastName.slice(0, 1)}.</h1>
              <p className="text-sm text-muted-foreground">{athlete.sports.join(", ")} · {athlete.positions.join(", ")}</p>
            </div>
          </div>
          <p className="text-sm">{athlete.city}, {athlete.state} · Class of {athlete.gradYear ?? "—"}</p>
          {!limited && <p className="text-sm leading-relaxed">{athlete.bio}</p>}
          {limited && <p className="text-sm text-muted-foreground">Full measurables and highlights stay hidden until this athlete applies.</p>}
          {!limited && athlete.measurables.map((item) => (
            <p key={item.label} className="text-sm">{item.label}: {item.value}</p>
          ))}
        </div>
      )}
    </Page>
  );
}
