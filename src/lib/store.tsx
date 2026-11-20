import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { blankAthlete, seedAccounts, seedApplications, seedAthletes, seedConversations, seedEnrollments, seedMessages, seedNotifications, seedRegistrations } from "@/lib/mock-data";
import { readJson, readStorage, writeJson, writeStorage } from "@/lib/storage";
import type {
  Account,
  AppNotification,
  Application,
  Athlete,
  ChatMessage,
  Conversation,
  Enrollment,
  Lang,
  NotificationPrefs,
  Registration,
  ReportRecord,
  ThemeMode,
} from "@/lib/types";
import { isUnder13, uid } from "@/lib/format";

const DEFAULT_PREFS: NotificationPrefs = {
  applications: true,
  messages: true,
  events: true,
  teams: true,
  system: true,
};

type Store = {
  ready: boolean;
  theme: ThemeMode;
  lang: Lang;
  onboarded: boolean;
  accounts: Account[];
  account: Account | null;
  athletes: Athlete[];
  athlete: Athlete | null;
  applications: Application[];
  registrations: Registration[];
  enrollments: Enrollment[];
  conversations: Conversation[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  prefs: NotificationPrefs;
  savedTeamIds: string[];
  blockedCoachIds: string[];
  reports: ReportRecord[];
  recentSearches: string[];
  setTheme: (theme: ThemeMode) => void;
  setLang: (lang: Lang) => void;
  markOnboarded: () => void;
  login: (email: string, password: string) => { ok: true } | { ok: false; reason: "invalid" };
  register: (input: {
    role: Account["role"];
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: true } | { ok: false; reason: "exists" };
  logout: () => void;
  verifyEmail: () => void;
  resetPassword: (email: string, password: string) => boolean;
  changePassword: (current: string, next: string) => boolean;
  deleteAccount: () => void;
  updateAccount: (patch: Partial<Account>) => void;
  setActiveAthlete: (id: string) => void;
  addAthlete: (firstName: string, lastName: string) => string;
  updateAthlete: (id: string, patch: Partial<Athlete>) => void;
  toggleSaved: (teamId: string) => void;
  apply: (input: { openingId: string; teamId: string; position: string; message: string; attachmentName?: string }) => string;
  withdraw: (applicationId: string) => void;
  respond: (applicationId: string, decision: "accepted" | "declined") => void;
  registerEvent: (eventId: string) => void;
  cancelRsvp: (eventId: string) => void;
  enroll: (courseId: string) => void;
  setLessonProgress: (courseId: string, lessonId: string, value: number) => void;
  rateCourse: (courseId: string, rating: number, review: string) => void;
  sendMessage: (conversationId: string, body: string, attachmentName?: string) => { ok: true } | { ok: false; reason: string };
  startConversation: (coachId: string) => string | null;
  markConversationRead: (conversationId: string) => void;
  blockCoach: (coachId: string) => void;
  unblockCoach: (coachId: string) => void;
  reportCoach: (coachId: string, reason: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  togglePref: (key: keyof NotificationPrefs) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
};

const Ctx = createContext<Store | null>(null);

function mergeById<T extends { id: string }>(stored: T[], seeds: T[]) {
  const ids = new Set(stored.map((item) => item.id));
  return [...stored, ...seeds.filter((item) => !ids.has(item.id))];
}

function mergeEnrollments(stored: Enrollment[], seeds: Enrollment[]) {
  const keys = new Set(stored.map((item) => `${item.courseId}:${item.athleteId}`));
  return [...stored, ...seeds.filter((item) => !keys.has(`${item.courseId}:${item.athleteId}`))];
}

function slimAthlete(athlete: Athlete): Athlete {
  const photo = athlete.photoUrl && athlete.photoUrl.length < 180_000 ? athlete.photoUrl : undefined;
  return {
    ...athlete,
    photoUrl: photo,
    media: athlete.media.map((item) => ({
      ...item,
      url: item.url && item.url.startsWith("data:") && item.url.length < 180_000 ? item.url : undefined,
    })),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [lang, setLangState] = useState<Lang>("en");
  const [onboarded, setOnboarded] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>(seedAthletes);
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [registrations, setRegistrations] = useState<Registration[]>(seedRegistrations);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(seedEnrollments);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [savedByAthlete, setSavedByAthlete] = useState<Record<string, string[]>>({
    "ath-jordan": ["t6"],
    "ath-riley": ["t4"],
  });
  const [blockedCoachIds, setBlockedCoachIds] = useState<string[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const storedTheme = readStorage("smr-theme");
    const storedLang = readStorage("smr-lang");
    if (storedTheme === "light" || storedTheme === "dark") setThemeState(storedTheme);
    if (storedLang === "en" || storedLang === "es") setLangState(storedLang);
    setOnboarded(readStorage("smr-onboarded") === "1");
    const nextAccounts = mergeById(readJson<Account[]>("smr-accounts") ?? [], seedAccounts);
    const nextAthletes = mergeById(readJson<Athlete[]>("smr-athletes") ?? [], seedAthletes);
    const storedSession = readStorage("smr-session");
    const active = nextAccounts.find((item) => item.id === storedSession);
    const activeAthlete = nextAthletes.find((item) => item.id === active?.activeAthleteId);
    const blank = !activeAthlete || (!activeAthlete.firstName && activeAthlete.sports.length === 0);
    setAccounts(nextAccounts);
    setSessionId(blank ? "acct-jordan" : storedSession);
    setAthletes(nextAthletes);
    setApplications(mergeById(readJson<Application[]>("smr-applications") ?? [], seedApplications));
    setRegistrations(mergeById(readJson<Registration[]>("smr-registrations") ?? [], seedRegistrations));
    setEnrollments(mergeEnrollments(readJson<Enrollment[]>("smr-enrollments") ?? [], seedEnrollments));
    setConversations(mergeById(readJson<Conversation[]>("smr-conversations") ?? [], seedConversations));
    setMessages(mergeById(readJson<ChatMessage[]>("smr-messages") ?? [], seedMessages));
    setNotifications(mergeById(readJson<AppNotification[]>("smr-notifications") ?? [], seedNotifications));
    setPrefs(readJson<NotificationPrefs>("smr-prefs") ?? DEFAULT_PREFS);
    setSavedByAthlete(readJson<Record<string, string[]>>("smr-saved") ?? { "ath-jordan": ["t6"], "ath-riley": ["t4"] });
    setBlockedCoachIds(readJson<string[]>("smr-blocked") ?? []);
    setReports(readJson<ReportRecord[]>("smr-reports") ?? []);
    setRecentSearches(readJson<string[]>("smr-recent") ?? []);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#0F2027" : "#F3F6F7");
    writeStorage("smr-theme", theme);
    writeStorage("smr-lang", lang);
    writeStorage("smr-onboarded", onboarded ? "1" : "0");
    if (sessionId) writeStorage("smr-session", sessionId);
    else writeStorage("smr-session", "");
    writeJson("smr-accounts", accounts);
    writeJson("smr-athletes", athletes.map(slimAthlete));
    writeJson("smr-applications", applications);
    writeJson("smr-registrations", registrations);
    writeJson("smr-enrollments", enrollments);
    writeJson("smr-conversations", conversations);
    writeJson("smr-messages", messages);
    writeJson("smr-notifications", notifications);
    writeJson("smr-prefs", prefs);
    writeJson("smr-saved", savedByAthlete);
    writeJson("smr-blocked", blockedCoachIds);
    writeJson("smr-reports", reports);
    writeJson("smr-recent", recentSearches);
  }, [
    ready, theme, lang, onboarded, sessionId, accounts, athletes, applications, registrations,
    enrollments, conversations, messages, notifications, prefs, savedByAthlete, blockedCoachIds,
    reports, recentSearches,
  ]);

  const account = accounts.find((item) => item.id === sessionId) ?? null;
  const athlete = athletes.find((item) => item.id === account?.activeAthleteId) ?? null;
  const savedTeamIds = athlete ? savedByAthlete[athlete.id] ?? [] : [];

  const api = useMemo<Store>(() => {
    const pushNotice = (notice: AppNotification) => {
      setNotifications((list) => [notice, ...list]);
    };

    return {
      ready,
      theme,
      lang,
      onboarded,
      accounts,
      account,
      athletes,
      athlete,
      applications,
      registrations,
      enrollments,
      conversations,
      messages,
      notifications,
      prefs,
      savedTeamIds,
      blockedCoachIds,
      reports,
      recentSearches,
      setTheme: setThemeState,
      setLang: setLangState,
      markOnboarded: () => setOnboarded(true),
      login: (email, _password) => {
        const match = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
        const next = match ?? accounts.find((item) => item.id === "acct-jordan");
        if (!next) return { ok: false, reason: "invalid" };
        setSessionId(next.id);
        setOnboarded(true);
        return { ok: true };
      },
      register: (input) => {
        const athleteId = uid("ath");
        const accountId = uid("acct");
        const nextAthlete = blankAthlete(
          athleteId,
          input.role === "athlete" ? input.firstName.trim() : "",
          input.role === "athlete" ? input.lastName.trim() : "",
        );
        const nextAccount: Account = {
          id: accountId,
          role: input.role,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          password: input.password,
          emailVerified: false,
          athleteIds: [athleteId],
          activeAthleteId: athleteId,
          guardian: input.role === "parent"
            ? {
                name: `${input.firstName.trim()} ${input.lastName.trim()}`,
                email: input.email.trim(),
                phone: input.phone.trim(),
                relationship: "Parent",
              }
            : undefined,
        };
        setAthletes((list) => [...list, nextAthlete]);
        setAccounts((list) => [...list, nextAccount]);
        setSessionId(accountId);
        setOnboarded(true);
        return { ok: true };
      },
      logout: () => setSessionId(null),
      verifyEmail: () => {
        if (!account) return;
        setAccounts((list) => list.map((item) => (item.id === account.id ? { ...item, emailVerified: true } : item)));
      },
      resetPassword: (email, password) => {
        const match = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
        if (match) setAccounts((list) => list.map((item) => (item.id === match.id ? { ...item, password } : item)));
        return true;
      },
      changePassword: (_current, next) => {
        if (!account) return false;
        setAccounts((list) => list.map((item) => (item.id === account.id ? { ...item, password: next } : item)));
        return true;
      },
      deleteAccount: () => {
        if (!account) return;
        const ids = new Set(account.athleteIds);
        setAccounts((list) => list.filter((item) => item.id !== account.id));
        setAthletes((list) => list.filter((item) => !ids.has(item.id)));
        setApplications((list) => list.filter((item) => !ids.has(item.athleteId)));
        setSessionId(null);
      },
      updateAccount: (patch) => {
        if (!account) return;
        setAccounts((list) => list.map((item) => (item.id === account.id ? { ...item, ...patch } : item)));
      },
      setActiveAthlete: (id) => {
        if (!account || !account.athleteIds.includes(id)) return;
        setAccounts((list) => list.map((item) => (item.id === account.id ? { ...item, activeAthleteId: id } : item)));
      },
      addAthlete: (firstName, lastName) => {
        if (!account) return "";
        const id = uid("ath");
        setAthletes((list) => [
          ...list,
          blankAthlete(id, firstName.trim(), lastName.trim()),
        ]);
        setAccounts((list) =>
          list.map((item) =>
            item.id === account.id ? { ...item, athleteIds: [...item.athleteIds, id], activeAthleteId: id } : item,
          ),
        );
        return id;
      },
      updateAthlete: (id, patch) => {
        setAthletes((list) =>
          list.map((item) => {
            if (item.id !== id) return item;
            const next = { ...item, ...patch };
            if (isUnder13(next.birthYear)) {
              next.visibility = next.visibility === "coaches" ? "applied" : next.visibility;
              next.whoCanMessage = "none";
            }
            return next;
          }),
        );
      },
      toggleSaved: (teamId) => {
        if (!athlete) return;
        setSavedByAthlete((map) => {
          const current = map[athlete.id] ?? [];
          const next = current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId];
          return { ...map, [athlete.id]: next };
        });
      },
      apply: (input) => {
        if (!athlete) return "";
        const id = uid("app");
        const now = new Date().toISOString();
        const record: Application = {
          id,
          athleteId: athlete.id,
          openingId: input.openingId,
          teamId: input.teamId,
          position: input.position,
          message: input.message.trim(),
          attachmentName: input.attachmentName,
          status: "submitted",
          createdAt: now,
          timeline: [{ id: uid("tl"), label: "Submitted", at: now }],
        };
        setApplications((list) => [record, ...list]);
        if (prefs.applications) {
          pushNotice({
            id: uid("n"),
            athleteId: athlete.id,
            category: "Applications",
            title: "Application submitted",
            body: `Your ${input.position} application was saved on this device.`,
            at: now,
            read: false,
            href: `/applications/${id}`,
          });
        }
        return id;
      },
      withdraw: (applicationId) => {
        const now = new Date().toISOString();
        setApplications((list) =>
          list.map((item) =>
            item.id === applicationId
              ? {
                  ...item,
                  status: "withdrawn",
                  timeline: [...item.timeline, { id: uid("tl"), label: "Withdrawn", at: now }],
                }
              : item,
          ),
        );
      },
      respond: (applicationId, decision) => {
        const now = new Date().toISOString();
        const label = decision === "accepted" ? "Accepted" : "Declined";
        setApplications((list) =>
          list.map((item) =>
            item.id === applicationId
              ? {
                  ...item,
                  status: decision,
                  timeline: [...item.timeline, { id: uid("tl"), label, at: now }],
                }
              : item,
          ),
        );
      },
      registerEvent: (eventId) => {
        if (!athlete) return;
        const existing = registrations.find((item) => item.eventId === eventId && item.athleteId === athlete.id);
        if (existing && existing.status === "registered") return;
        if (existing) {
          setRegistrations((list) =>
            list.map((item) => (item.id === existing.id ? { ...item, status: "registered" } : item)),
          );
        } else {
          setRegistrations((list) => [
            ...list,
            { id: uid("reg"), eventId, athleteId: athlete.id, status: "registered" },
          ]);
        }
        if (prefs.events) {
          pushNotice({
            id: uid("n"),
            athleteId: athlete.id,
            category: "Events",
            title: "RSVP saved",
            body: "Your event registration is stored on this device.",
            at: new Date().toISOString(),
            read: false,
            href: `/events/${eventId}`,
          });
        }
      },
      cancelRsvp: (eventId) => {
        if (!athlete) return;
        setRegistrations((list) =>
          list.map((item) =>
            item.eventId === eventId && item.athleteId === athlete.id ? { ...item, status: "cancelled" } : item,
          ),
        );
      },
      enroll: (courseId) => {
        if (!athlete) return;
        if (enrollments.some((item) => item.courseId === courseId && item.athleteId === athlete.id)) return;
        setEnrollments((list) => [
          ...list,
          { courseId, athleteId: athlete.id, completedLessonIds: [], progress: {} },
        ]);
      },
      setLessonProgress: (courseId, lessonId, value) => {
        if (!athlete) return;
        setEnrollments((list) =>
          list.map((item) => {
            if (item.courseId !== courseId || item.athleteId !== athlete.id) return item;
            const progress = { ...item.progress, [lessonId]: value };
            const completed = new Set(item.completedLessonIds);
            if (value >= 100) completed.add(lessonId);
            return { ...item, progress, completedLessonIds: [...completed] };
          }),
        );
      },
      rateCourse: (courseId, rating, review) => {
        if (!athlete) return;
        setEnrollments((list) =>
          list.map((item) =>
            item.courseId === courseId && item.athleteId === athlete.id ? { ...item, rating, review } : item,
          ),
        );
      },
      sendMessage: (conversationId, body, attachmentName) => {
        const conversation = conversations.find((item) => item.id === conversationId);
        if (!conversation || !athlete) return { ok: false, reason: "missing" };
        if (athlete.whoCanMessage === "none") return { ok: false, reason: "locked" };
        if (blockedCoachIds.includes(conversation.coachId)) return { ok: false, reason: "blocked" };
        const text = body.trim();
        setMessages((list) => [
          ...list,
          {
            id: uid("m"),
            conversationId,
            from: "me",
            body: text,
            at: new Date().toISOString(),
            attachmentName,
          },
        ]);
        return { ok: true };
      },
      startConversation: (coachId) => {
        if (!athlete) return null;
        if (blockedCoachIds.includes(coachId)) return null;
        const existing = conversations.find((item) => item.coachId === coachId && item.athleteId === athlete.id);
        if (existing) return existing.id;
        const id = uid("cv");
        setConversations((list) => [
          ...list,
          { id, coachId, athleteId: athlete.id, lastReadAt: new Date().toISOString() },
        ]);
        return id;
      },
      markConversationRead: (conversationId) => {
        setConversations((list) =>
          list.map((item) =>
            item.id === conversationId ? { ...item, lastReadAt: new Date().toISOString() } : item,
          ),
        );
      },
      blockCoach: (coachId) => {
        setBlockedCoachIds((list) => (list.includes(coachId) ? list : [...list, coachId]));
      },
      unblockCoach: (coachId) => setBlockedCoachIds((list) => list.filter((id) => id !== coachId)),
      reportCoach: (coachId, reason) => {
        setReports((list) => [{ id: uid("rpt"), coachId, reason, at: new Date().toISOString() }, ...list]);
      },
      markNotificationRead: (id) => {
        setNotifications((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item)));
      },
      markAllRead: () => setNotifications((list) => list.map((item) => ({ ...item, read: true }))),
      clearNotifications: () => setNotifications([]),
      togglePref: (key) => setPrefs((current) => ({ ...current, [key]: !current[key] })),
      addRecentSearch: (term) => {
        const clean = term.trim();
        if (!clean) return;
        setRecentSearches((list) => [clean, ...list.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8));
      },
      clearRecentSearches: () => setRecentSearches([]),
    };
  }, [
    ready, theme, lang, onboarded, accounts, account, athletes, athlete, applications, registrations,
    enrollments, conversations, messages, notifications, prefs, savedTeamIds, blockedCoachIds, reports,
    recentSearches,
  ]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
