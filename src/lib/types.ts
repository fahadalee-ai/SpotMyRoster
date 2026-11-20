export type Role = "athlete" | "parent";
export type ThemeMode = "dark" | "light";
export type Lang = "en" | "es";

export type ApplicationStatus =
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "invited"
  | "offered"
  | "accepted"
  | "declined"
  | "withdrawn";

export type Visibility = "coaches" | "applied" | "private";
export type MessagePolicy = "coaches" | "none";

export type Guardian = {
  name: string;
  email: string;
  phone: string;
  relationship: string;
};

export type MediaItem = {
  id: string;
  kind: "photo" | "video" | "file";
  name: string;
  url?: string;
};

export type Measurable = { label: string; value: string };

export type PastTeam = { name: string; seasons: string };

export type Athlete = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  birthYear: number | null;
  gradYear: number | null;
  sports: string[];
  positions: string[];
  height: string;
  weight: string;
  dominantSide: string;
  skillLevel: string;
  currentTeam: string;
  city: string;
  state: string;
  travelRadius: number;
  availability: string[];
  bio: string;
  achievements: string[];
  measurables: Measurable[];
  media: MediaItem[];
  pastTeams: PastTeam[];
  visibility: Visibility;
  whoCanMessage: MessagePolicy;
  setupComplete: boolean;
};

export type Account = {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  emailVerified: boolean;
  athleteIds: string[];
  activeAthleteId: string;
  guardian?: Guardian;
  consentAt?: string;
};

export type Coach = {
  id: string;
  name: string;
  city: string;
  state: string;
  bio: string;
  years: number;
  teamIds: string[];
};

export type Team = {
  id: string;
  name: string;
  sport: string;
  ageGroup: string;
  gender: "Girls" | "Boys" | "Coed";
  level: string;
  city: string;
  state: string;
  distanceMiles: number;
  coachId: string;
  about: string;
  homeField: string;
  address: string;
  notes: string[];
};

export type Opening = {
  id: string;
  teamId: string;
  position: string;
  spots: number;
  deadline: string;
  notes: string;
};

export type TimelineEvent = { id: string; label: string; at: string };

export type Application = {
  id: string;
  athleteId: string;
  openingId: string;
  teamId: string;
  position: string;
  message: string;
  attachmentName?: string;
  status: ApplicationStatus;
  createdAt: string;
  timeline: TimelineEvent[];
};

export type SportEvent = {
  id: string;
  title: string;
  sport: string;
  kind: "Tryout" | "Showcase" | "Camp";
  start: string;
  end: string;
  city: string;
  state: string;
  venue: string;
  address: string;
  teamId?: string;
  summary: string;
  spotsLeft: number;
};

export type Registration = {
  id: string;
  eventId: string;
  athleteId: string;
  status: "registered" | "cancelled";
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  points: string[];
  practice: string;
};

export type Course = {
  id: string;
  title: string;
  sport: string;
  category: string;
  level: string;
  minutes: number;
  instructor: string;
  summary: string;
  image: "approach" | "discover" | "learn" | "court" | "skills";
  lessons: Lesson[];
  resources: { name: string; body: string }[];
};

export type Enrollment = {
  courseId: string;
  athleteId: string;
  completedLessonIds: string[];
  progress: Record<string, number>;
  rating?: number;
  review?: string;
};

export type Conversation = {
  id: string;
  coachId: string;
  athleteId: string;
  lastReadAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  from: "coach" | "me";
  body: string;
  at: string;
  attachmentName?: string;
};

export type NoticeCategory = "Applications" | "Messages" | "Events" | "Teams" | "System";

export type AppNotification = {
  id: string;
  athleteId?: string;
  category: NoticeCategory;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
};

export type NotificationPrefs = {
  applications: boolean;
  messages: boolean;
  events: boolean;
  teams: boolean;
  system: boolean;
};

export type ReportRecord = {
  id: string;
  coachId: string;
  reason: string;
  at: string;
};

export type TeamFilters = {
  q: string;
  sport: string;
  position: string;
  ageGroup: string;
  level: string;
  gender: string;
  radius: number | null;
  deadline: "any" | "14" | "30";
  sort: "distance" | "deadline" | "spots";
};
