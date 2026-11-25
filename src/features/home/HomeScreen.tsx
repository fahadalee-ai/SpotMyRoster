import { Link } from "@tanstack/react-router";
import { Bell, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { images } from "@/lib/images";
import { isPremium } from "@/lib/premium";
import { mapsUrl } from "@/lib/format";
import { useTitle } from "@/components/athlete/ui";

const sports = [
  ["baseball", "Baseball", "⚾"],
  ["softball", "Softball", "🥎"],
  ["soccer", "Soccer", "⚽"],
  ["basketball", "Basketball", "🏀"],
  ["football", "Football", "🏈"],
  ["volleyball", "Volleyball", "🏐"],
  ["track-and-field", "Track and Field", "👟"],
  ["lacrosse", "Lacrosse", "🥍"],
  ["ice-hockey", "Ice Hockey", "🏒"],
] as const;

const upcoming = [
  { day: "14", month: "MAR", title: "Ridgeline U14 — Spring Tryout", place: "Maple Grove Park, Oakland CA, 9:30 AM · 4.1 mi", kind: "Tryout" },
  { day: "16", month: "MAR", title: "Northside Invitational — Pool B", place: "Cedar Field, Berkeley CA, 11:00 AM · 7.8 mi", kind: "Tournament" },
  { day: "04", month: "APR", title: "Spring Skills Camp (Day 1)", place: "Fairview Complex, Hayward CA, 8:00 AM · 12.3 mi", kind: "Tournament" },
];

export function HomeScreen() {
  const [plan, setPlan] = useState("Parent Account");
  useTitle("Dashboard");
  useEffect(() => {
    setPlan(isPremium() ? "Premium Parent Account" : "Free Parent Account");
  }, []);

  return (
    <div className="min-h-dvh bg-background pb-8 text-foreground">
      <header className="bg-background px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <img src={images.logoOnDark} alt="SpotMyRoster" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label="Notifications" className="inline-flex size-10 items-center justify-center rounded-full bg-elevated text-foreground">
              <Bell size={18} />
            </Link>
            <span className="flex min-w-0 items-center gap-2">
              <Link to="/profile" aria-label="My Athlete" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">JD</Link>
              <span className="min-w-0">
                <Link to="/profile" className="block truncate text-xs font-semibold leading-tight">Jordan Davis</Link>
                <Link to="/subscription" className="block truncate text-[10px] leading-tight text-muted-foreground">{plan}</Link>
              </span>
            </span>
          </div>
        </div>
        <Link to="/search" className="mt-3 flex h-11 items-center gap-2 rounded-full bg-elevated px-4 text-sm text-muted-foreground">
          <Search size={16} />
          Search tryouts, teams, tournaments, or trainers
        </Link>
      </header>

      <div className="px-4 pt-5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-primary">TUESDAY, MARCH 12</p>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold uppercase leading-[0.95] tracking-tight">
          Good morning, Jordan —
        </h1>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          Emma has a tryout this weekend and 2 tournaments on the radar. Here's what's moving.
        </p>

        <section className="mt-5 rounded-3xl bg-card p-4 ring-1 ring-border">
          <h2 className="font-display text-sm font-semibold uppercase leading-5 tracking-wide">
            What are you looking for, for Emma?
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {sports.map(([id, label, icon]) => (
              <Link key={id} to="/sports/$sportId" params={{ sportId: id }} className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-2xl bg-elevated px-1 py-3 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-lg" aria-hidden>
                  {icon}
                </span>
                <span className="text-[10px] font-semibold uppercase leading-3 tracking-wide">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Upcoming for Emma</h2>
          <div className="mt-3 space-y-2">
            {upcoming.map((item) => (
              <Link key={item.title} to="/events" className="flex items-center gap-3 rounded-2xl bg-card px-3 py-3 ring-1 ring-border">
                <span className="inline-flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <span className="text-sm font-bold leading-none">{item.day}</span>
                  <span className="mt-0.5 text-[9px] font-semibold tracking-wide">{item.month}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold uppercase">{item.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{item.place}</span>
                </span>
                <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">{item.kind}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-primary p-4 text-primary-foreground">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Upcoming events</p>
          <h3 className="mt-1 font-display text-base font-semibold uppercase leading-tight">Ridgeline U14 — Spring Tryout</h3>
          <p className="mt-2 text-sm">Ridgeline U14 — Spring Tryout</p>
          <p className="text-sm">Saturday, March 14 · 9:30 AM</p>
          <p className="mt-2 flex items-start gap-1.5 text-sm">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>Maple Grove Park<br />[Full address when available]</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/events" className="flex h-10 items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground">View Calendar</Link>
            <a href={mapsUrl("Maple Grove Park, Oakland, CA")} className="flex h-10 items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground">Get Directions</a>
          </div>
        </section>

        <section className="mt-3 rounded-3xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide">Saved opportunities</h3>
            <span className="text-2xl font-semibold leading-none">12</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">3 new matches since Monday</p>
          <Link to="/saved" className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground">View All</Link>
        </section>
      </div>
    </div>
  );
}
