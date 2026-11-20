import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { coaches } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Athlete, NotificationPrefs } from "@/lib/types";
import { isUnder13 } from "@/lib/format";
import { LanguagePicker } from "@/components/LanguagePicker";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Btn, EmptyState, Page, PasswordField, RowLink, SelectField, TextField, useCopy } from "@/components/athlete/ui";

export function AccountScreen() {
  const { account, athlete, logout } = useApp();
  const copy = useCopy();
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();
  if (!account || !athlete) return null;

  return (
    <Page title={copy.account} right={<Link to="/profile" className="text-sm font-semibold text-link">Profile</Link>}>
      <p className="text-sm text-muted-foreground">{account.firstName} {account.lastName} · {account.role === "parent" ? "Parent" : "Athlete"}</p>
      <p className="mt-1 text-sm">{account.email}</p>
      <div className="mt-4 rounded-3xl bg-card px-4 ring-1 ring-border">
        <RowLink to="/account/password" title="Change password" />
        <RowLink to="/account/athletes" title="Athlete profiles" detail={account.role === "parent" ? "Switch or add" : "This login"} />
        <RowLink to="/account/guardian" title="Parent / guardian" />
        <RowLink to="/account/notifications" title="Notification settings" />
        <RowLink to="/account/privacy" title="Privacy" />
        <RowLink to="/account/blocked" title="Blocked coaches" />
        <RowLink to="/account/appearance" title={copy.appearance} />
        <RowLink to="/account/language" title={copy.languageTitle} />
        <RowLink to="/legal/terms" title="Terms" />
        <RowLink to="/legal/privacy" title="Privacy notice" />
        <RowLink to="/account/help" title={copy.help} />
        <RowLink to="/account/about" title={copy.about} />
        <RowLink to="/account/delete" title="Delete account" />
      </div>
      <Btn variant="secondary" full className="mt-5" onClick={() => setConfirm(true)}>{copy.logout}</Btn>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>You can sign back in with the sample account. Data stays on this device.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}

export function AccountSectionScreen({ section }: { section: string }) {
  switch (section) {
    case "password":
      return <PasswordSection />;
    case "athletes":
      return <AthletesSection />;
    case "guardian":
      return <GuardianSection />;
    case "notifications":
      return <NotificationsSection />;
    case "privacy":
      return <PrivacySection />;
    case "blocked":
      return <BlockedSection />;
    case "appearance":
      return <AppearanceSection />;
    case "language":
      return <LanguageSection />;
    case "help":
      return <HelpSection />;
    case "about":
      return <AboutSection />;
    case "delete":
      return <DeleteSection />;
    default:
      return <Page title="Account"><EmptyState title="That setting is not here" body="Go back to account." to="/account" action="Account" /></Page>;
  }
}

function PasswordSection() {
  const { changePassword } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");
  return (
    <Page title="Change password">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!changePassword(current, next)) {
            setFormError("Current password does not match.");
            return;
          }
          toast("Password updated on this device");
          setFormError("");
          setCurrent("");
          setNext("");
          setConfirm("");
        }}
      >
        <PasswordField label="Current password" value={current} onChange={(event) => setCurrent(event.target.value)} />
        <PasswordField label="New password" value={next} onChange={(event) => setNext(event.target.value)} />
        <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Btn type="submit" full>Update password</Btn>
      </form>
    </Page>
  );
}

function AthletesSection() {
  const { account, athletes, athlete, setActiveAthlete, addAthlete } = useApp();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  if (!account || !athlete) return null;
  const mine = athletes.filter((item) => account.athleteIds.includes(item.id));
  return (
    <Page title="Athlete profiles">
      <div className="space-y-2">
        {mine.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === athlete.id}
            onClick={() => { setActiveAthlete(item.id); toast(`Showing ${item.firstName}`); }}
            className={`flex min-h-14 w-full items-center justify-between rounded-2xl px-4 text-left ring-1 ${item.id === athlete.id ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border"}`}
          >
            <span>
              <span className="block font-semibold">{item.firstName} {item.lastName}</span>
              <span className={`block text-sm ${item.id === athlete.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{item.sports.join(", ") || "Profile in progress"}</span>
            </span>
            {item.id === athlete.id && <span className="text-sm font-semibold">Active</span>}
          </button>
        ))}
      </div>
      {account.role === "parent" && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            addAthlete(first, last);
            toast("Athlete added. Finish the profile setup.");
            setFirst("");
            setLast("");
          }}
        >
          <h2 className="font-display text-lg font-semibold">Add an athlete</h2>
          <TextField label="First name" value={first} onChange={(event) => setFirst(event.target.value)} />
          <TextField label="Last name" value={last} onChange={(event) => setLast(event.target.value)} />
          <Btn type="submit" full>Add athlete</Btn>
        </form>
      )}
    </Page>
  );
}

function GuardianSection() {
  const { account, updateAccount } = useApp();
  const [name, setName] = useState(account?.guardian?.name ?? "");
  const [email, setEmail] = useState(account?.guardian?.email ?? "");
  const [phone, setPhone] = useState(account?.guardian?.phone ?? "");
  const [relationship, setRelationship] = useState(account?.guardian?.relationship ?? "Parent");
  if (!account) return null;
  return (
    <Page title="Parent / guardian">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          updateAccount({ guardian: { name: name.trim(), email: email.trim(), phone: phone.trim(), relationship } });
          toast("Guardian details saved on this device");
        }}
      >
        <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <SelectField label="Relationship" value={relationship} onChange={setRelationship} options={["Parent", "Guardian"].map((item) => ({ value: item, label: item }))} />
        <Btn type="submit" full>Save</Btn>
      </form>
    </Page>
  );
}

function NotificationsSection() {
  const { prefs, togglePref } = useApp();
  const rows: Array<{ key: keyof NotificationPrefs; label: string }> = [
    { key: "applications", label: "Applications" },
    { key: "messages", label: "Messages" },
    { key: "events", label: "Events" },
    { key: "teams", label: "Teams" },
    { key: "system", label: "System" },
  ];
  return (
    <Page title="Notifications">
      <ul className="rounded-3xl bg-card px-4 ring-1 ring-border">
        {rows.map((row) => (
          <li key={row.key} className="flex min-h-14 items-center justify-between gap-3 border-b border-border last:border-0">
            <span className="font-medium">{row.label}</span>
            <Switch checked={prefs[row.key]} onCheckedChange={() => togglePref(row.key)} aria-label={row.label} />
          </li>
        ))}
      </ul>
    </Page>
  );
}

function PrivacySection() {
  const { athlete, updateAthlete } = useApp();
  if (!athlete) return null;
  const under13 = isUnder13(athlete.birthYear);
  const setVisibility = (visibility: Athlete["visibility"]) => {
    if (under13 && visibility === "coaches") {
      toast("Under 13, this sample keeps the profile off the full coach view.");
      return;
    }
    updateAthlete(athlete.id, { visibility });
  };
  return (
    <Page title="Privacy">
      {under13 && <p className="mb-4 rounded-2xl bg-warning/20 p-3 text-sm">This athlete is under 13. Messaging stays off. Full public coach view stays off. Age rules still need legal confirmation from the client.</p>}
      <SelectField
        label="Who can view the profile"
        value={athlete.visibility}
        onChange={(value) => setVisibility(value as Athlete["visibility"])}
        options={[
          { value: "coaches", label: "Coaches" },
          { value: "applied", label: "Only teams I apply to" },
          { value: "private", label: "Private" },
        ]}
      />
      <div className="mt-4">
        <SelectField
          label="Who can message"
          value={athlete.whoCanMessage}
          onChange={(value) => {
            if (under13) {
              toast("Messaging stays off for athletes under 13 in this sample.");
              return;
            }
            updateAthlete(athlete.id, { whoCanMessage: value as Athlete["whoCanMessage"] });
          }}
          options={[
            { value: "coaches", label: "Coaches" },
            { value: "none", label: "No one" },
          ]}
        />
      </div>
    </Page>
  );
}

function BlockedSection() {
  const { blockedCoachIds, unblockCoach } = useApp();
  const blocked = coaches.filter((coach) => blockedCoachIds.includes(coach.id));
  return (
    <Page title="Blocked coaches">
      {blocked.length === 0 ? (
        <EmptyState title="No blocked coaches" body="Block someone from a conversation. The block stays on this device." />
      ) : (
        <ul className="space-y-2">
          {blocked.map((coach) => (
            <li key={coach.id} className="flex min-h-14 items-center justify-between rounded-2xl bg-card px-4 ring-1 ring-border">
              <span className="font-semibold">{coach.name}</span>
              <button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={() => unblockCoach(coach.id)}>Unblock</button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useApp();
  const copy = useCopy();
  return (
    <Page title={copy.appearance}>
      <div className="grid grid-cols-2 gap-3">
        {(["dark", "light"] as const).map((mode) => (
          <button key={mode} type="button" aria-pressed={theme === mode} onClick={() => setTheme(mode)} className={`min-h-24 rounded-3xl p-4 text-left ring-1 ${theme === mode ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border"}`}>
            <span className="block font-semibold">{mode === "dark" ? copy.dark : copy.light}</span>
            <span className="mt-1 block text-sm opacity-80">{mode === "dark" ? "Default" : "Off-white"}</span>
          </button>
        ))}
      </div>
    </Page>
  );
}

function LanguageSection() {
  const { lang, setLang } = useApp();
  const copy = useCopy();
  return (
    <Page title={copy.languageTitle}>
      <LanguagePicker value={lang} onChange={setLang} />
      {copy.spanishContent && <p className="mt-4 text-sm text-muted-foreground">{copy.spanishContent}</p>}
    </Page>
  );
}

function HelpSection() {
  return (
    <Page title="Help and support">
      <p className="text-sm leading-relaxed">Questions about a team, an application, or this sample build can go to the business contacts below.</p>
      <div className="mt-4 space-y-3 rounded-3xl bg-card p-4 ring-1 ring-border">
        <a className="block min-h-11 font-semibold text-link" href="mailto:greg@spotmyroster.com">greg@spotmyroster.com</a>
        <a className="block min-h-11 font-semibold text-link" href="tel:+12202467172">+1 220-246-7172</a>
        <a className="block min-h-11 font-semibold text-link" href="https://www.spotmyroster.com" target="_blank" rel="noreferrer">spotmyroster.com</a>
      </div>
      <h2 className="mb-2 mt-6 font-semibold">Using the app</h2>
      <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <li>Find Teams lists sample roster openings. Filters and save stay on this device.</li>
        <li>Applications track a status timeline. Accept, decline, and withdraw update that timeline locally.</li>
        <li>Parents can switch athletes from Athlete profiles. Under-13 profiles keep messaging off.</li>
      </ul>
    </Page>
  );
}

function AboutSection() {
  return (
    <Page title="About">
      <h1 className="font-display text-2xl font-semibold">SpotMyRoster</h1>
      <p className="mt-2 text-sm leading-relaxed">A sample athlete app for families looking at travel-sports teams and for coaches posting roster needs. The live website is still a coming-soon page.</p>
      <p className="mt-4 text-sm">Athlete app sample · version 0.2</p>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Headings are set in Tactic Sans when that font file is installed. Until then, Inter Tight is the named fallback. Required file: a Tactic Sans webfont (for example TacticSans-Bold.otf) licensed for the product.</p>
    </Page>
  );
}

function DeleteSection() {
  const { deleteAccount } = useApp();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Page title="Delete account">
      <p className="text-sm leading-relaxed">This removes the sample account from this device. It does not contact a server.</p>
      <TextField className="mt-4" label='Type DELETE to confirm' value={text} onChange={(event) => setText(event.target.value)} />
      <Btn variant="danger" full className="mt-4" disabled={text !== "DELETE"} onClick={() => setOpen(true)}>Delete account</Btn>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>Athlete profiles on this login are removed from the device.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteAccount(); navigate({ to: "/login", replace: true }); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
