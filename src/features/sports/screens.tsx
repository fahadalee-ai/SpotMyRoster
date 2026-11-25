import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Heart, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listingById, sportById, sportFilters, type SportFilter, type SportListing } from "@/lib/sports";
import { downloadIcs, mapsUrl } from "@/lib/format";
import { readJson, writeJson } from "@/lib/storage";
import { useTitle } from "@/components/athlete/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

function BackButton({ to, params }: { to: "/home" | "/sports/$sportId"; params?: { sportId: string } }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : navigate({ to, params }))}
      className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground"
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}

function milesLabel(miles: number) {
  return Number.isInteger(miles) ? String(miles) : miles.toFixed(1);
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={14} className={index < value ? "fill-primary text-primary" : "text-muted-foreground"} />
      ))}
    </span>
  );
}

function saveInquiry(title: string, detail: string, status: string) {
  const list = readJson<Array<{ id: string; title: string; detail: string; status: string }>>("smr-inquiries") ?? [];
  writeJson("smr-inquiries", [...list, { id: `inq-${Date.now()}`, title, detail, status }]);
}

const SAVED_KEY = "smr-sport-saves";

function useSavedListings() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const raw = sessionStorage.getItem(SAVED_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSaved(parsed.filter((id) => typeof id === "string"));
    } catch {
      sessionStorage.removeItem(SAVED_KEY);
    }
  }, []);
  function toggle(id: string) {
    setSaved((list) => {
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      sessionStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }
  return { saved, toggle };
}

export function SportScreen({ sportId }: { sportId: string }) {
  const sport = sportById(sportId);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SportFilter | "">("");
  const { saved, toggle } = useSavedListings();
  useTitle(sport?.name ?? "Sport");

  const visible = useMemo(() => {
    if (!sport) return [];
    const term = query.trim().toLowerCase();
    return sport.listings.filter((item) => {
      if (kind && item.kind !== kind) return false;
      if (!term) return true;
      return `${item.name} ${item.subtitle} ${item.city}`.toLowerCase().includes(term);
    });
  }, [sport, query, kind]);

  if (!sport) {
    return (
      <div className="min-h-dvh bg-background px-4 pt-6 text-foreground">
        <BackButton to="/home" />
        <p className="mt-4">That sport is not listed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/home" />
      <h1 className="mt-2 font-display text-[2rem] font-semibold uppercase leading-none">{sport.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Find teams, tryouts, players and opportunities near you.</p>

      <div className="mt-4 rounded-3xl bg-card p-3 ring-1 ring-border">
        <label className="flex h-11 items-center gap-2 rounded-full bg-elevated px-4 text-sm text-muted-foreground">
          <Search size={16} />
          <span className="sr-only">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tryouts, teams, tournaments, or trainers"
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
          <SlidersHorizontal size={16} />
        </label>
        <p className="mb-2 mt-3 text-sm font-semibold">What Are You Looking For?</p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sportFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKind(kind === item ? "" : item)}
              className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${kind === item ? "bg-primary text-primary-foreground" : "bg-elevated text-foreground"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <h2 className="mb-3 mt-6 font-display text-sm font-semibold uppercase tracking-wide">Recommended for Emma</h2>
      <div className="space-y-3">
        {visible.length === 0 && <p className="text-sm text-muted-foreground">Nothing in {sport.name} matches that filter.</p>}
        {visible.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
            <img src={item.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <span>{sport.name} · {item.kind}</span>
                {item.featured && <span className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground">Featured</span>}
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold uppercase leading-tight">{item.name}</h3>
              <p className="mt-1 text-sm">{item.subtitle}</p>
              <p className="text-sm text-muted-foreground">{item.city} · {item.miles} miles</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="inline-flex h-10 items-center gap-1 rounded-full bg-elevated px-3 text-xs font-semibold"
                >
                  <Heart size={14} className={saved.includes(item.id) ? "fill-primary text-primary" : ""} />
                  {saved.includes(item.id) ? "Saved" : "Save"}
                </button>
                <Link
                  to="/sports/$sportId/$listingId"
                  params={{ sportId: sport.id, listingId: item.id }}
                  className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground"
                >
                  View Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SportListingScreen({ sportId, listingId }: { sportId: string; listingId: string }) {
  const found = listingById(sportId, listingId);
  const { saved, toggle } = useSavedListings();
  const [inquire, setInquire] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [athleteName, setAthleteName] = useState("Emma Davis");
  const [parentName, setParentName] = useState("Jordan Davis");
  const [email, setEmail] = useState("jordan@email.com");
  const [phone, setPhone] = useState("(555) 555-0198");
  const [note, setNote] = useState("");
  const [share, setShare] = useState(false);
  const [organizerNote, setOrganizerNote] = useState("");
  useTitle(found?.listing.name ?? "Listing");

  if (!found) {
    return (
      <div className="min-h-dvh bg-background px-4 pt-6 text-foreground">
        <BackButton to="/home" />
        <p className="mt-4">That listing is not available.</p>
      </div>
    );
  }

  const { sport, listing } = found;
  const isSaved = saved.includes(listing.id);
  return (
    <div className="min-h-dvh bg-background px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-foreground">
      <BackButton to="/sports/$sportId" params={{ sportId: sport.id }} />
      <img src={listing.image} alt={`${listing.name}, ${sport.name}`} className="mt-3 h-40 w-full rounded-3xl object-cover" />

      <section className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-2xl" aria-hidden>
            {sport.icon}
          </span>
          <div className="min-w-0">
            {listing.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                <Star size={10} className="fill-primary-foreground" /> Featured
              </span>
            )}
            <h1 className="mt-1 font-display text-[1.55rem] font-semibold uppercase leading-none">{listing.name}</h1>
            <p className="mt-1 text-sm">{listing.line}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} /> {listing.city}, CA · {milesLabel(listing.miles)} miles away
            </p>
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">About the opportunity</h2>
        <p className="mt-2 text-sm leading-relaxed">{listing.about}</p>
        <h2 className="mb-3 mt-5 font-display text-sm font-semibold uppercase tracking-wide">Details</h2>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
          <Detail label="Date" value={listing.when} />
          <Detail label="Location">
            <a className="text-primary" href={mapsUrl(listing.address)} target="_blank" rel="noreferrer">
              {listing.address} · {milesLabel(listing.addressMiles)} mi
            </a>
          </Detail>
          <Detail label="Ages" value={listing.ages} />
          <Detail label="Positions" value={listing.positions} />
          <Detail label="Cost" value={listing.cost} />
          <Detail label="Category" value={listing.category} />
        </dl>
      </section>

      <section className="mt-3 rounded-3xl bg-elevated p-4 ring-1 ring-border">
        <p className="text-sm font-semibold text-primary">{listing.panel}</p>
        <p className="mt-1 font-display text-2xl font-semibold uppercase leading-none">{listing.fee}</p>
        <p className="mt-3 text-sm">Coach: <span className="text-primary">{listing.coach}</span></p>
        <p className="mt-1 flex items-center gap-2 text-sm">Rating: <Stars value={listing.rating} /></p>
        <div className="mt-4 space-y-2">
          <button type="button" onClick={() => setInquire(true)} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            Register / Inquire
          </button>
          <button
            type="button"
            onClick={() => {
              toggle(listing.id);
              toast(isSaved ? "Removed from saved" : "Saved on this device");
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-background text-sm font-semibold ring-1 ring-border"
          >
            <Heart size={16} className={isSaved ? "fill-primary text-primary" : ""} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={() => setMessageOpen(true)} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-background text-sm font-semibold ring-1 ring-border">
            Message Organizer
          </button>
          <button
            type="button"
            onClick={() => {
              downloadIcs({
                title: listing.name,
                start: listing.start,
                end: listing.end,
                location: listing.address,
                description: listing.about,
              });
              toast("Calendar file downloaded");
            }}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-background text-sm font-semibold ring-1 ring-border"
          >
            Add To Calendar
          </button>
        </div>
      </section>

      <InquiryDialog
        open={inquire}
        listing={listing}
        athleteName={athleteName}
        parentName={parentName}
        email={email}
        phone={phone}
        note={note}
        share={share}
        onAthlete={setAthleteName}
        onParent={setParentName}
        onEmail={setEmail}
        onPhone={setPhone}
        onNote={setNote}
        onShare={setShare}
        onClose={() => setInquire(false)}
      />
      <MessageDialog
        open={messageOpen}
        listing={listing}
        note={organizerNote}
        onNote={setOrganizerNote}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-snug">{children ?? value}</dd>
    </div>
  );
}

function InquiryDialog({
  open,
  listing,
  athleteName,
  parentName,
  email,
  phone,
  note,
  share,
  onAthlete,
  onParent,
  onEmail,
  onPhone,
  onNote,
  onShare,
  onClose,
}: {
  open: boolean;
  listing: SportListing;
  athleteName: string;
  parentName: string;
  email: string;
  phone: string;
  note: string;
  share: boolean;
  onAthlete: (value: string) => void;
  onParent: (value: string) => void;
  onEmail: (value: string) => void;
  onPhone: (value: string) => void;
  onNote: (value: string) => void;
  onShare: (value: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85dvh] max-w-[420px] overflow-y-auto rounded-3xl">
        <DialogTitle className="font-display uppercase">Register interest</DialogTitle>
        <DialogDescription>
          You’re registering interest for <span className="font-semibold text-foreground">{listing.name}</span> {listing.line}.
        </DialogDescription>
        <form
          className="space-y-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            saveInquiry(listing.name, note.trim() || `${athleteName} · ${parentName}`, "Inquiry sent");
            toast("Inquiry saved on this device");
            onClose();
          }}
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Athlete
            <select value={athleteName} onChange={(event) => onAthlete(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-elevated px-3 text-sm font-medium text-foreground">
              <option>Emma Davis</option>
              <option>Avery Hale</option>
              <option>Riley Hale</option>
            </select>
          </label>
          <Field label="Parent name" value={parentName} onChange={onParent} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Email" value={email} onChange={onEmail} />
            <Field label="Phone" value={phone} onChange={onPhone} />
          </div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Message
            <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder="Tell the coach something..." className="mt-1 min-h-24 w-full rounded-2xl bg-elevated px-3 py-2 text-sm text-foreground outline-none" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={share} onChange={(event) => onShare(event.target.checked)} />
            I agree to share my information
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold">Cancel</button>
            <button type="submit" className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Send Inquiry</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MessageDialog({
  open,
  listing,
  note,
  onNote,
  onClose,
}: {
  open: boolean;
  listing: SportListing;
  note: string;
  onNote: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[420px] rounded-3xl">
        <DialogTitle className="font-display uppercase">Message {listing.coach}</DialogTitle>
        <DialogDescription>This stays on your device. It is not sent to a live organizer.</DialogDescription>
        <form
          className="space-y-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            saveInquiry(listing.name, note.trim() || `Message for ${listing.coach}`, "Message saved");
            toast("Message saved on this device");
            onNote("");
            onClose();
          }}
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Message
            <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder={`Write ${listing.coach}...`} className="mt-1 min-h-28 w-full rounded-2xl bg-elevated px-3 py-2 text-sm text-foreground outline-none" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold">Cancel</button>
            <button type="submit" className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Send</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-elevated px-3 text-sm font-medium text-foreground outline-none" />
    </label>
  );
}
