import { Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AGE_GROUPS, AVAILABILITY, POSITIONS, SKILL_LEVELS, SPORTS, STATES } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Athlete } from "@/lib/types";
import { isMinor, isUnder13 } from "@/lib/format";
import { Btn, Chip, ProgressBar, SelectField, TextArea, TextField, useTitle } from "@/components/athlete/ui";

const steps = ["Athlete", "Sport", "Body", "Location", "Story", "Safety", "Review"];

export function SetupScreen() {
  const { ready, account, athlete, updateAthlete, updateAccount, logout } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Athlete | null>(null);
  const [consent, setConsent] = useState(false);
  useTitle("Profile setup");

  useEffect(() => {
    if (!athlete) return;
    setDraft(athlete);
    setConsent(Boolean(account?.consentAt));
  }, [athlete, account?.consentAt]);

  if (!ready) return <div className="min-h-dvh bg-background" />;
  if (!account) return <Navigate to="/login" replace />;
  if (!draft) return null;

  const patch = (partial: Partial<Athlete>) => setDraft((current) => (current ? { ...current, ...partial } : current));
  const positions = draft.sports.flatMap((sport) => POSITIONS[sport] ?? []);
  const minor = isMinor(draft.birthYear);
  const under13 = isUnder13(draft.birthYear);

  const persist = (complete: boolean) => {
    const next: Athlete = {
      ...draft,
      setupComplete: complete,
      whoCanMessage: under13 ? "none" : draft.whoCanMessage,
      visibility: under13 && draft.visibility === "coaches" ? "applied" : draft.visibility,
    };
    updateAthlete(draft.id, next);
    if (minor && consent) {
      updateAccount({ consentAt: account.consentAt ?? new Date().toISOString() });
    }
  };

  const finish = () => {
    persist(true);
    toast("Profile saved on this device");
    navigate({ to: "/home", replace: true });
  };

  return (
    <div className="min-h-dvh bg-background px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          Step {step + 1} of {steps.length}
        </p>
        <button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={() => { persist(false); toast("Progress saved. Sign in again to continue setup."); logout(); navigate({ to: "/login" }); }}>
          Save and exit
        </button>
      </div>
      <ProgressBar value={Math.round(((step + 1) / steps.length) * 100)} label={steps[step]} />
      <h1 className="mt-5 font-display text-[1.75rem] font-semibold">{steps[step]}</h1>
      <div className="mt-5 space-y-4">
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="First name" value={draft.firstName} onChange={(event) => patch({ firstName: event.target.value })} />
              <TextField label="Last name" value={draft.lastName} onChange={(event) => patch({ lastName: event.target.value })} />
            </div>
            <SelectField
              label="Birth year"
              value={draft.birthYear ? String(draft.birthYear) : ""}
              onChange={(value) => patch({ birthYear: Number(value) })}
              options={Array.from({ length: 18 }, (_, index) => 2008 + index).map((year) => ({ value: String(year), label: String(year) }))}
            />
            <SelectField
              label="Graduation year"
              value={draft.gradYear ? String(draft.gradYear) : ""}
              onChange={(value) => patch({ gradYear: Number(value) })}
              options={Array.from({ length: 12 }, (_, index) => 2026 + index).map((year) => ({ value: String(year), label: String(year) }))}
            />
            <PhotoField
              url={draft.photoUrl}
              onPick={(photoUrl) => patch({ photoUrl })}
            />
          </>
        )}
        {step === 1 && (
          <>
            <p className="text-sm font-semibold">Sports</p>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <Chip
                  key={sport}
                  selected={draft.sports.includes(sport)}
                  onClick={() => {
                    const sports = draft.sports.includes(sport)
                      ? draft.sports.filter((item) => item !== sport)
                      : [...draft.sports, sport];
                    const allowed = new Set(sports.flatMap((item) => POSITIONS[item] ?? []));
                    patch({ sports, positions: draft.positions.filter((position) => allowed.has(position)) });
                  }}
                >
                  {sport}
                </Chip>
              ))}
            </div>
            <p className="text-sm font-semibold">Positions</p>
            <div className="flex flex-wrap gap-2">
              {positions.map((position) => (
                <Chip
                  key={position}
                  selected={draft.positions.includes(position)}
                  onClick={() =>
                    patch({
                      positions: draft.positions.includes(position)
                        ? draft.positions.filter((item) => item !== position)
                        : [...draft.positions, position],
                    })
                  }
                >
                  {position}
                </Chip>
              ))}
            </div>
            <SelectField label="Skill level" value={draft.skillLevel} onChange={(skillLevel) => patch({ skillLevel })} options={SKILL_LEVELS.map((level) => ({ value: level, label: level }))} />
            <SelectField label="Dominant side" value={draft.dominantSide} onChange={(dominantSide) => patch({ dominantSide })} options={["Right", "Left", "Both"].map((side) => ({ value: side, label: side }))} />
          </>
        )}
        {step === 2 && (
          <>
            <TextField label="Height" placeholder={`5'11"`} value={draft.height} onChange={(event) => patch({ height: event.target.value })} />
            <TextField label="Weight" placeholder="165 lb" value={draft.weight} onChange={(event) => patch({ weight: event.target.value })} />
            <TextField label="Current team" value={draft.currentTeam} onChange={(event) => patch({ currentTeam: event.target.value })} />
            <p className="text-xs text-muted-foreground">Height and weight are optional. Age groups in the catalog include {AGE_GROUPS.join(", ")}.</p>
          </>
        )}
        {step === 3 && (
          <>
            <TextField label="City" value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
            <SelectField label="State" value={draft.state} onChange={(state) => patch({ state })} options={STATES.map((state) => ({ value: state, label: state }))} />
            <SelectField
              label="Travel radius"
              value={String(draft.travelRadius)}
              onChange={(value) => patch({ travelRadius: Number(value) })}
              options={[25, 50, 100, 150, 300, 500].map((miles) => ({ value: String(miles), label: `${miles} miles` }))}
            />
            <p className="text-sm font-semibold">Availability</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY.map((item) => (
                <Chip
                  key={item}
                  selected={draft.availability.includes(item)}
                  onClick={() =>
                    patch({
                      availability: draft.availability.includes(item)
                        ? draft.availability.filter((value) => value !== item)
                        : [...draft.availability, item],
                    })
                  }
                >
                  {item}
                </Chip>
              ))}
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <TextArea label="Bio" value={draft.bio} onChange={(event) => patch({ bio: event.target.value })} />
            <TextField
              label="Add an achievement"
              placeholder="Press enter to add"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const value = event.currentTarget.value.trim();
                if (!value) return;
                patch({ achievements: [...draft.achievements, value] });
                event.currentTarget.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              {draft.achievements.map((item) => (
                <Chip key={item} selected onClick={() => patch({ achievements: draft.achievements.filter((value) => value !== item) })}>
                  {item} ×
                </Chip>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            {minor && (
              <div className="rounded-2xl bg-warning/20 p-4 text-sm leading-relaxed">
                This birth year is under 18. A parent or guardian has to be on the account.
                {under13 && " Under 13, messaging stays off and the profile cannot be fully public. COPPA and age rules still need confirmation from SpotMyRoster’s legal counsel. This sample only stores a choice on this device."}
              </div>
            )}
            <TextField
              label="Parent / guardian name"
              value={account.guardian?.name ?? ""}
              onChange={(event) => updateAccount({ guardian: { name: event.target.value, email: account.guardian?.email ?? "", phone: account.guardian?.phone ?? "", relationship: account.guardian?.relationship ?? "Parent" } })}
            />
            <TextField
              label="Guardian email"
              type="email"
              value={account.guardian?.email ?? ""}
              onChange={(event) => updateAccount({ guardian: { name: account.guardian?.name ?? "", email: event.target.value, phone: account.guardian?.phone ?? "", relationship: account.guardian?.relationship ?? "Parent" } })}
            />
            <TextField
              label="Guardian phone"
              value={account.guardian?.phone ?? ""}
              onChange={(event) => updateAccount({ guardian: { name: account.guardian?.name ?? "", email: account.guardian?.email ?? "", phone: event.target.value, relationship: account.guardian?.relationship ?? "Parent" } })}
            />
            <SelectField
              label="Who can view this profile"
              value={draft.visibility}
              onChange={(visibility) => patch({ visibility: visibility as Athlete["visibility"] })}
              options={[
                { value: "coaches", label: under13 ? "Coaches (locked off under 13)" : "Coaches" },
                { value: "applied", label: "Only teams I apply to" },
                { value: "private", label: "Private" },
              ]}
            />
            <SelectField
              label="Who can message"
              value={draft.whoCanMessage}
              onChange={(whoCanMessage) => patch({ whoCanMessage: whoCanMessage as Athlete["whoCanMessage"] })}
              options={[
                { value: "coaches", label: under13 ? "Coaches (locked off under 13)" : "Coaches on my applications" },
                { value: "none", label: "No one — parent manages contact" },
              ]}
            />
            {minor && (
              <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
                <input type="checkbox" className="mt-1 size-5" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>A parent or guardian agrees to manage this minor profile. This is a sample consent record, not a legal agreement.</span>
              </label>
            )}
          </>
        )}
        {step === 6 && (
          <div className="space-y-2 rounded-3xl bg-card p-4 text-sm ring-1 ring-border">
            <p className="font-display text-xl font-semibold">{draft.firstName} {draft.lastName}</p>
            <p>{draft.sports.join(", ") || "No sport yet"} · {draft.positions.join(", ") || "No position yet"}</p>
            <p>{draft.city || "City"}, {draft.state || "State"} · {draft.travelRadius} miles</p>
            <p className="text-muted-foreground">{draft.bio || "No bio yet."}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Btn variant="secondary" onClick={() => setStep((value) => value - 1)}>
            Back
          </Btn>
        )}
        {step < steps.length - 1 ? (
          <Btn full onClick={() => { persist(false); setStep((value) => value + 1); }}>
            Continue
          </Btn>
        ) : (
          <Btn full onClick={finish}>Finish profile</Btn>
        )}
      </div>
    </div>
  );
}

function PhotoField({ url, onPick }: { url?: string; onPick: (url: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8125rem] font-semibold">Photo</span>
      <span className="flex min-h-12 items-center gap-3 rounded-2xl bg-elevated px-3 ring-1 ring-border">
        {url ? <img src={url} alt="" className="size-10 rounded-full object-cover" /> : <span className="text-sm text-muted-foreground">Optional</span>}
        <span className="text-sm font-semibold">Choose a photo</span>
      </span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") onPick(reader.result);
          };
          reader.readAsDataURL(file);
        }}
      />
    </label>
  );
}
