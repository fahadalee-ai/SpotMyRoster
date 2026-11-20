import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Clock, FileText, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { courses } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { downloadText } from "@/lib/format";
import { courseImage } from "@/lib/images";
import type { Course, Enrollment, Lesson } from "@/lib/types";
import { Btn, Chip, ChipRow, EmptyState, ErrorState, Page, ProgressBar, PullToRefresh, SearchField, useListState } from "@/components/athlete/ui";

function percent(course: Course, enrollment?: Enrollment) {
  if (!enrollment || course.lessons.length === 0) return 0;
  return Math.round((enrollment.completedLessonIds.length / course.lessons.length) * 100);
}

function nextLesson(course: Course, enrollment?: Enrollment) {
  return course.lessons.find((lesson) => !enrollment?.completedLessonIds.includes(lesson.id)) ?? course.lessons[0];
}

function lessonSteps(lesson: Lesson) {
  return [
    { label: "Objective", body: lesson.summary },
    ...lesson.points.map((body, index) => ({ label: `Key point ${index + 1}`, body })),
    { label: "Practice", body: lesson.practice },
  ];
}

export function LearnScreen() {
  const list = useListState();
  const { athlete, enrollments } = useApp();
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");
  const sports = [...new Set(courses.map((course) => course.sport))];
  const visible = courses.filter((course) => {
    const hay = `${course.title} ${course.category} ${course.sport} ${course.instructor}`.toLowerCase();
    if (query && !hay.includes(query.trim().toLowerCase())) return false;
    if (sport && course.sport !== sport) return false;
    if (level && course.level !== level) return false;
    return true;
  });
  const mine = enrollments.filter((item) => item.athleteId === athlete?.id);
  const inProgress = mine
    .map((enrollment) => ({ enrollment, course: courses.find((course) => course.id === enrollment.courseId) }))
    .filter((row): row is { enrollment: Enrollment; course: Course } => Boolean(row.course))
    .filter((row) => row.enrollment.completedLessonIds.length < row.course.lessons.length);
  const resume = inProgress[0];
  const lessonsDone = mine.reduce((sum, item) => sum + item.completedLessonIds.length, 0);

  return (
    <Page title="Learn" back={false} right={<Link to="/learn/mine" className="text-sm font-semibold text-link">My courses</Link>}>
      <PullToRefresh onRefresh={list.refresh}>
        {resume && (
          <Link
            to="/learn/$courseId/lessons/$lessonId"
            params={{ courseId: resume.course.id, lessonId: nextLesson(resume.course, resume.enrollment).id }}
            className="mb-5 flex gap-3 overflow-hidden rounded-3xl bg-card ring-1 ring-border"
          >
            <img src={courseImage(resume.course.image)} alt="" className="h-28 w-24 shrink-0 object-cover" />
            <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Continue</span>
              <span className="mt-1 truncate font-display text-lg font-semibold leading-tight">{resume.course.title}</span>
              <span className="mt-1 truncate text-sm text-muted-foreground">{nextLesson(resume.course, resume.enrollment).title}</span>
              <span className="mt-2 block">
                <ProgressBar value={percent(resume.course, resume.enrollment)} />
              </span>
            </span>
          </Link>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Stat value={String(courses.length)} label="Courses" />
          <Stat value={String(mine.length)} label="Enrolled" />
          <Stat value={String(lessonsDone)} label="Lessons done" />
        </div>

        <div className="mt-5">
          <SearchField value={query} onChange={setQuery} placeholder="Search courses" />
        </div>
        <ChipRow className="mt-3">
          <Chip selected={!sport && !level} onClick={() => { setSport(""); setLevel(""); }}>All</Chip>
          {sports.map((item) => <Chip key={item} selected={sport === item} onClick={() => setSport(sport === item ? "" : item)}>{item}</Chip>)}
          <Chip selected={level === "Foundations"} onClick={() => setLevel(level === "Foundations" ? "" : "Foundations")}>Foundations</Chip>
          <Chip selected={level === "Intermediate"} onClick={() => setLevel(level === "Intermediate" ? "" : "Intermediate")}>Intermediate</Chip>
        </ChipRow>

        <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Catalog</h2>
        {list.loading && <div className="h-40 animate-pulse rounded-3xl bg-muted" />}
        {list.error && <ErrorState title="Courses didn’t load" body="Try again when you are online." onRetry={list.refresh} />}
        {!list.loading && !list.error && visible.length === 0 && (
          <EmptyState title="No courses" body="Try another sport or clear the search." action="Clear" onAction={() => { setQuery(""); setSport(""); setLevel(""); }} />
        )}
        {!list.loading && !list.error && (
          <div className="space-y-3">
            {visible.map((course) => (
              <CourseRow key={course.id} course={course} enrollment={mine.find((item) => item.courseId === course.id)} />
            ))}
          </div>
        )}
      </PullToRefresh>
    </Page>
  );
}

export function MyCoursesScreen() {
  const { athlete, enrollments } = useApp();
  const mine = courses
    .map((course) => ({ course, enrollment: enrollments.find((item) => item.courseId === course.id && item.athleteId === athlete?.id) }))
    .filter((row): row is { course: Course; enrollment: Enrollment } => Boolean(row.enrollment));
  const active = mine.filter((row) => row.enrollment.completedLessonIds.length < row.course.lessons.length);
  const done = mine.filter((row) => row.enrollment.completedLessonIds.length >= row.course.lessons.length);

  return (
    <Page title="My courses">
      {mine.length === 0 ? (
        <EmptyState title="No courses yet" body="Open a course and enroll. Your lessons and progress stay on this device." to="/learn" action="Browse courses" />
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">In progress</h2>
              <div className="space-y-3">
                {active.map(({ course, enrollment }) => {
                  const lesson = nextLesson(course, enrollment);
                  return (
                    <div key={course.id} className="rounded-3xl bg-card p-4 ring-1 ring-border">
                      <Link to="/learn/$courseId" params={{ courseId: course.id }} className="block">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{course.sport} · {course.level}</p>
                        <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{course.title}</h3>
                      </Link>
                      <div className="mt-3">
                        <ProgressBar value={percent(course, enrollment)} label={`${enrollment.completedLessonIds.length} of ${course.lessons.length} lessons`} />
                      </div>
                      <Link
                        to="/learn/$courseId/lessons/$lessonId"
                        params={{ courseId: course.id, lessonId: lesson.id }}
                        className="mt-3 flex min-h-11 items-center justify-between rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                      >
                        Continue · {lesson.title}
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">Completed</h2>
              <div className="space-y-3">
                {done.map(({ course, enrollment }) => (
                  <CourseRow key={course.id} course={course} enrollment={enrollment} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Page>
  );
}

export function CourseScreen({ courseId }: { courseId: string }) {
  const course = courses.find((item) => item.id === courseId);
  const { athlete, enrollments, enroll, rateCourse } = useApp();
  const enrollment = enrollments.find((item) => item.courseId === courseId && item.athleteId === athlete?.id);
  const [rating, setRating] = useState(enrollment?.rating ?? 0);
  const [review, setReview] = useState(enrollment?.review ?? "");
  if (!course) return <Page title="Course"><EmptyState title="Course not found" body="That course is not in the catalog." to="/learn" action="All courses" /></Page>;

  const progress = percent(course, enrollment);
  const upcoming = nextLesson(course, enrollment);
  const finished = Boolean(enrollment && progress === 100);

  return (
    <Page title="Course">
      <div className="overflow-hidden rounded-3xl bg-[#162830] text-white">
        <div className="relative h-44">
          <img src={courseImage(course.image)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027] via-[#0F2027]/40 to-transparent" />
          <div className="absolute inset-x-4 bottom-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00E5FF]">{course.sport} · {course.category}</p>
            <h1 className="mt-1 font-display text-[1.65rem] font-semibold leading-tight">{course.title}</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
          <Fact value={`${course.lessons.length}`} label="Lessons" />
          <Fact value={`${course.minutes} min`} label="Total" />
          <Fact value={course.level} label="Level" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed">{course.summary}</p>
      <p className="mt-3 text-sm text-muted-foreground">Taught by {course.instructor}</p>

      {enrollment && (
        <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
          <ProgressBar value={progress} label={finished ? "Course complete" : "Course progress"} />
          {!finished && (
            <Link
              to="/learn/$courseId/lessons/$lessonId"
              params={{ courseId: course.id, lessonId: upcoming.id }}
              className="mt-3 flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Continue · {upcoming.title}
            </Link>
          )}
        </div>
      )}
      {!enrollment && (
        <Btn className="mt-4" full onClick={() => { enroll(course.id); toast("You’re enrolled. Progress stays on this device."); }}>
          Enroll
        </Btn>
      )}

      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Syllabus</h2>
      <ol className="space-y-2">
        {course.lessons.map((lesson, index) => {
          const done = enrollment?.completedLessonIds.includes(lesson.id);
          const current = !done && lesson.id === upcoming.id && Boolean(enrollment);
          const partial = enrollment?.progress[lesson.id] ?? 0;
          return (
            <li key={lesson.id}>
              <Link
                to="/learn/$courseId/lessons/$lessonId"
                params={{ courseId: course.id, lessonId: lesson.id }}
                className="flex items-center gap-3 rounded-2xl bg-card px-3 py-3 ring-1 ring-border"
              >
                <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${done ? "bg-primary text-primary-foreground" : "bg-elevated"}`}>
                  {done ? <Check size={16} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{lesson.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {lesson.minutes} min
                    {done ? " · Complete" : current ? " · Up next" : partial > 0 ? ` · ${partial}%` : ""}
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ol>

      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Resources</h2>
      <ul className="space-y-2">
        {course.resources.map((resource) => (
          <li key={resource.name}>
            <button
              type="button"
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-card px-3 text-left ring-1 ring-border"
              onClick={() => downloadText(resource.name, resource.body)}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-elevated">
                <FileText size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{resource.name.replace(".txt", "")}</span>
                <span className="text-xs text-muted-foreground">Download notes</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {enrollment && (
        <div className="mt-6 rounded-3xl bg-card p-4 ring-1 ring-border">
          <p className="font-semibold">Rate this course</p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" aria-label={`${value} star`} className="inline-flex size-11 items-center justify-center" onClick={() => setRating(value)}>
                <Star size={22} className={value <= (rating || enrollment.rating || 0) ? "fill-primary text-primary" : "text-muted-foreground"} />
              </button>
            ))}
          </div>
          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-2xl bg-elevated px-3 py-3 text-base ring-1 ring-border"
            placeholder="What was useful?"
          />
          <Btn className="mt-3" onClick={() => { rateCourse(course.id, rating || enrollment.rating || 0, review); toast("Rating saved on this device"); }}>
            Save rating
          </Btn>
        </div>
      )}
    </Page>
  );
}

export function LessonScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const course = courses.find((item) => item.id === courseId);
  const lesson = course?.lessons.find((item) => item.id === lessonId);
  const { enrollments, athlete, setLessonProgress } = useApp();
  const enrollment = enrollments.find((item) => item.courseId === courseId && item.athleteId === athlete?.id);
  const navigate = useNavigate();
  const steps = lesson ? lessonSteps(lesson) : [];
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
  }, [lessonId]);

  if (!course || !lesson) {
    return <Page title="Lesson"><EmptyState title="Lesson not found" body="Go back to the course." to="/learn" action="Courses" /></Page>;
  }

  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  const previous = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const current = steps[step] ?? steps[0];
  const done = enrollment?.completedLessonIds.includes(lesson.id);
  const saved = enrollment?.progress[lesson.id] ?? (done ? 100 : 0);

  const openLesson = (target: Lesson) => {
    navigate({ to: "/learn/$courseId/lessons/$lessonId", params: { courseId: course.id, lessonId: target.id } });
  };

  const save = (value: number) => {
    setLessonProgress(course.id, lesson.id, value);
  };

  const go = (direction: -1 | 1) => {
    const target = step + direction;
    if (target < 0) {
      if (previous) openLesson(previous);
      return;
    }
    if (target >= steps.length) {
      save(100);
      toast("Lesson complete");
      if (next) openLesson(next);
      else navigate({ to: "/learn/$courseId", params: { courseId: course.id } });
      return;
    }
    setStep(target);
    save(Math.round(((target + 1) / steps.length) * 100));
  };

  return (
    <Page
      title="Lesson"
      fallback={`/learn/${course.id}`}
      right={<Link to="/learn/$courseId" params={{ courseId: course.id }} className="text-sm font-semibold text-link">Syllabus</Link>}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{course.title}</p>
      <h1 className="mt-1 font-display text-[1.65rem] font-semibold leading-tight">{lesson.title}</h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock size={14} />
        Lesson {index + 1} of {course.lessons.length} · {lesson.minutes} min
        {done ? " · Complete" : ""}
      </p>

      <div className="mt-4">
        <ProgressBar value={step >= steps.length - 1 && saved >= 100 ? 100 : Math.max(saved, Math.round(((step + 1) / steps.length) * 100))} label={`Step ${step + 1} of ${steps.length}`} />
      </div>

      <article className="mt-4 rounded-3xl bg-card p-5 ring-1 ring-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{current.label}</p>
        <p className="mt-2 text-base leading-relaxed">{current.body}</p>
      </article>

      <div className="mt-4 flex gap-2">
        <Btn variant="secondary" className="flex-1" onClick={() => go(-1)} disabled={step === 0 && !previous}>
          Back
        </Btn>
        <Btn className="flex-1" onClick={() => go(1)}>
          {step === steps.length - 1 ? (next ? "Finish lesson" : "Complete course") : "Next"}
        </Btn>
      </div>
      {!done && (
        <Btn
          variant="secondary"
          full
          className="mt-2"
          onClick={() => {
            save(100);
            toast("Lesson marked complete");
          }}
        >
          Mark complete
        </Btn>
      )}

      <h2 className="mb-3 mt-6 font-display text-lg font-semibold">In this course</h2>
      <ol className="space-y-2">
        {course.lessons.map((item, itemIndex) => {
          const complete = enrollment?.completedLessonIds.includes(item.id);
          const active = item.id === lesson.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => openLesson(item)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left ring-1 ${active ? "bg-elevated ring-primary" : "bg-card ring-border"}`}
              >
                <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {complete ? <Check size={14} /> : itemIndex + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card px-2 py-3 text-center ring-1 ring-border">
      <p className="font-display text-xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[0.7rem] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 py-3">
      <p className="text-sm font-semibold leading-tight">{value}</p>
      <p className="mt-1 text-[0.7rem] text-white/70">{label}</p>
    </div>
  );
}

function CourseRow({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  const progress = percent(course, enrollment);
  const status = !enrollment ? "Not enrolled" : progress >= 100 ? "Complete" : "In progress";
  return (
    <Link to="/learn/$courseId" params={{ courseId: course.id }} className="flex gap-3 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
      <img src={courseImage(course.image)} alt="" className="h-28 w-24 shrink-0 object-cover" />
      <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{course.sport} · {course.level}</span>
        <span className="mt-1 font-display text-lg font-semibold leading-tight">{course.title}</span>
        <span className="mt-1 text-sm text-muted-foreground">{course.lessons.length} lessons · {course.minutes} min · {status}</span>
        {enrollment && (
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </span>
        )}
      </span>
    </Link>
  );
}
