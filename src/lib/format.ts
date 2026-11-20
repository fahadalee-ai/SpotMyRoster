import { format, parseISO } from "date-fns";
import type { ApplicationStatus, Athlete } from "@/lib/types";

export function formatDay(iso: string) {
  return format(parseISO(iso), "EEE, MMM d");
}

export function formatWhen(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy · h:mm a");
}

export function formatShort(iso: string) {
  return format(parseISO(iso), "MMM d");
}

export function athleteName(athlete: Pick<Athlete, "firstName" | "lastName">) {
  return `${athlete.firstName} ${athlete.lastName}`.trim();
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ageFromBirthYear(year: number | null, nowYear = 2026) {
  if (!year) return null;
  return nowYear - year;
}

export function isMinor(year: number | null, nowYear = 2026) {
  if (!year) return false;
  return nowYear - year < 18;
}

export function isUnder13(year: number | null, nowYear = 2026) {
  if (!year) return false;
  return nowYear - year < 13;
}

export function completeness(athlete: Athlete) {
  const checks = [
    athlete.photoUrl,
    athlete.firstName.trim(),
    athlete.lastName.trim(),
    athlete.birthYear,
    athlete.sports.length,
    athlete.positions.length,
    athlete.city.trim(),
    athlete.state.trim(),
    athlete.bio.trim(),
    athlete.achievements.length,
    athlete.availability.length,
    athlete.measurables.length,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  viewed: "Viewed",
  shortlisted: "Shortlisted",
  invited: "Invited to tryout",
  offered: "Offered",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export function statusLabel(status: ApplicationStatus) {
  return statusLabels[status];
}

export function statusClass(status: ApplicationStatus) {
  switch (status) {
    case "shortlisted":
      return "bg-primary text-primary-foreground";
    case "invited":
      return "bg-warning text-warning-foreground";
    case "offered":
    case "accepted":
      return "bg-success text-success-foreground";
    case "declined":
      return "bg-destructive text-destructive-foreground";
    case "submitted":
      return "bg-info text-info-foreground";
    default:
      return "bg-muted text-foreground";
  }
}

export function downloadText(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadIcs(input: {
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
}) {
  const stamp = (iso: string) =>
    format(parseISO(iso), "yyyyMMdd'T'HHmmss");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SpotMyRoster//Athlete//EN",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(input.start)}`,
    `DTEND:${stamp(input.end)}`,
    `SUMMARY:${input.title.replace(/\n/g, " ")}`,
    `LOCATION:${input.location.replace(/\n/g, " ")}`,
    `DESCRIPTION:${input.description.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([body], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "spotmyroster-event.ics";
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareOrCopy(title: string, text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared" as const;
    } catch {
      return "cancelled" as const;
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  }
  return "failed" as const;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function mapsUrl(address: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}
