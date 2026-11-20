import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addMonths, format, startOfMonth, startOfWeek, addDays, isSameMonth, parseISO } from "date-fns";
import { events } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { downloadIcs, formatWhen, mapsUrl } from "@/lib/format";
import { EventCard } from "@/components/athlete/cards";
import { BottomSheet, Btn, Chip, ChipRow, EmptyState, ErrorState, Page, PullToRefresh, useListState } from "@/components/athlete/ui";

export function EventsScreen() {
  const list = useListState();
  const [mode, setMode] = useState<"list" | "calendar">("list");
  const [sport, setSport] = useState("");
  const [from, setFrom] = useState("");
  const [cursor, setCursor] = useState(new Date(2026, 10, 1));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sports = [...new Set(events.map((event) => event.sport))];
  const visible = events.filter((event) => {
    if (sport && event.sport !== sport) return false;
    if (from && event.start.slice(0, 10) < from) return false;
    return true;
  });

  return (
    <Page title="Events" back={false} right={<button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={() => setFiltersOpen(true)}>Filters</button>}>
      <ChipRow className="mb-4">
        <Chip selected={mode === "list"} onClick={() => setMode("list")}>List</Chip>
        <Chip selected={mode === "calendar"} onClick={() => setMode("calendar")}>Calendar</Chip>
        <Link to="/events/mine" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full bg-elevated px-3.5 text-sm font-semibold ring-1 ring-border">My events</Link>
      </ChipRow>
      <PullToRefresh onRefresh={list.refresh}>
        {list.loading && <div className="h-40 animate-pulse rounded-3xl bg-muted" />}
        {list.error && <ErrorState title="Events didn’t load" body="Try again when you are online." onRetry={list.refresh} />}
        {!list.loading && !list.error && mode === "list" && (
          <div className="space-y-3">
            {visible.length === 0 && <EmptyState title="No events" body="Nothing matches these filters." action="Clear" onAction={() => { setSport(""); setFrom(""); }} />}
            {visible.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
        {!list.loading && !list.error && mode === "calendar" && (
          <MonthGrid cursor={cursor} onPrev={() => setCursor(addMonths(cursor, -1))} onNext={() => setCursor(addMonths(cursor, 1))} dates={visible.map((event) => event.start.slice(0, 10))} />
        )}
      </PullToRefresh>
      <BottomSheet open={filtersOpen} title="Event filters" onClose={() => setFiltersOpen(false)}>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Sport</p>
          <div className="flex flex-wrap gap-2">
            <Chip selected={!sport} onClick={() => setSport("")}>Any</Chip>
            {sports.map((item) => <Chip key={item} selected={sport === item} onClick={() => setSport(item)}>{item}</Chip>)}
          </div>
          <label className="block text-sm font-semibold">
            From date
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl bg-elevated px-3 ring-1 ring-border" />
          </label>
          <Btn full onClick={() => setFiltersOpen(false)}>Apply</Btn>
        </div>
      </BottomSheet>
    </Page>
  );
}

function MonthGrid({ cursor, onPrev, onNext, dates }: { cursor: Date; onPrev: () => void; onNext: () => void; dates: string[] }) {
  const start = startOfWeek(startOfMonth(cursor));
  const days = Array.from({ length: 42 }, (_, index) => addDays(start, index));
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="min-h-11 px-2 font-semibold" onClick={onPrev}>Prev</button>
        <p className="font-display text-lg font-semibold">{format(cursor, "MMMM yyyy")}</p>
        <button type="button" className="min-h-11 px-2 font-semibold" onClick={onNext}>Next</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => <span key={`${label}${index}`}>{label}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const marked = dates.includes(key);
          return (
            <div key={key} className={`grid min-h-11 place-items-center rounded-xl text-sm ${isSameMonth(day, cursor) ? "bg-card" : "opacity-40"} ${marked ? "ring-2 ring-primary" : ""}`}>
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EventDetailScreen({ eventId }: { eventId: string }) {
  const event = events.find((item) => item.id === eventId);
  const { athlete, registrations, registerEvent, cancelRsvp } = useApp();
  if (!event || !athlete) return <Page title="Event"><EmptyState title="Event not found" body="That listing is not in the sample calendar." to="/events" action="All events" /></Page>;
  const registration = registrations.find((item) => item.eventId === event.id && item.athleteId === athlete.id && item.status === "registered");

  return (
    <Page title={event.kind}>
      <h1 className="font-display text-[1.7rem] font-semibold leading-tight">{event.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{formatWhen(event.start)} – {format(parseISO(event.end), "h:mm a")}</p>
      <p className="mt-1 text-sm">{event.venue} · {event.city}, {event.state}</p>
      <p className="mt-4 text-sm leading-relaxed">{event.summary}</p>
      <p className="mt-3 text-sm text-muted-foreground">{event.spotsLeft} spots listed in this sample.</p>
      <div className="mt-5 space-y-2">
        {registration ? (
          <Btn variant="secondary" full onClick={() => { cancelRsvp(event.id); toast("RSVP cancelled on this device"); }}>Cancel RSVP</Btn>
        ) : (
          <Btn full onClick={() => { registerEvent(event.id); toast("You’re registered in this sample"); }}>Register</Btn>
        )}
        <Btn
          variant="secondary"
          full
          onClick={() => {
            downloadIcs({ title: event.title, start: event.start, end: event.end, location: event.address, description: event.summary });
            toast("Calendar file downloaded");
          }}
        >
          Add to calendar
        </Btn>
        <a className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold text-link" href={mapsUrl(event.address)} target="_blank" rel="noreferrer">
          Directions
        </a>
      </div>
    </Page>
  );
}

export function MyEventsScreen() {
  const { athlete, registrations } = useApp();
  const mine = useMemo(
    () => events.filter((event) => registrations.some((item) => item.eventId === event.id && item.athleteId === athlete?.id && item.status === "registered")),
    [athlete, registrations],
  );
  return (
    <Page title="My events">
      {mine.length === 0 ? (
        <EmptyState title="No registrations" body="Register for a tryout, showcase, or camp and it will be listed here." to="/events" action="Browse events" />
      ) : (
        <div className="space-y-3">{mine.map((event) => <EventCard key={event.id} event={event} />)}</div>
      )}
    </Page>
  );
}
