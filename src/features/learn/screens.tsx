import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { courses } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { downloadText } from "@/lib/format";
import { courseImage } from "@/lib/images";
import { CourseCard } from "@/components/athlete/cards";
import { Btn, Chip, EmptyState, ErrorState, Page, ProgressBar, PullToRefresh, SearchField, useListState } from "@/components/athlete/ui";

export function LearnScreen() {
  const list = useListState();
  const { athlete, enrollments } = useApp();
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");
  const sports = [...new Set(courses.map((course) => course.sport))];
  const visible = courses.filter((course) => {
    const hay = `${course.title} ${course.category} ${course.sport}`.toLowerCase();
    if (query && !hay.includes(query.trim().toLowerCase())) return false;
    if (sport && course.sport !== sport) return false;
    if (level && course.level !== level) return false;
    return true;
  });
  const mine = enrollments.filter((item) => item.athleteId === athlete?.id);

  return (
    <Page title="Learn" back={false} right={<Link to="/learn/mine" className="text-sm font-semibold text-link">My courses</Link>}>
      <PullToRefresh onRefresh={list.refresh}>
        <SearchField value={query} onChange={setQuery} placeholder="Search courses" />
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Chip selected={!sport && !level} onClick={() => { setSport(""); setLevel(""); }}>All</Chip>
          {sports.map((item) => <Chip key={item} selected={sport === item} onClick={() => setSport(item)}>{item}</Chip>)}
          <Chip selected={level === "Foundations"} onClick={() => setLevel("Foundations")}>Foundations</Chip>
          <Chip selected={level === "Intermediate"} onClick={() => setLevel("Intermediate")}>Intermediate</Chip>
        </div>
        {mine.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">{mine.length} course{mine.length === 1 ? "" : "s"} in progress for this athlete.</p>
        )}
        <div className="mt-4 space-y-3">
          {list.loading && <div className="h-40 animate-pulse rounded-3xl bg-muted" />}
          {list.error && <ErrorState title="Courses didn’t load" body="Try again when you are online." onRetry={list.refresh} />}
          {!list.loading && !list.error && visible.length === 0 && <EmptyState title="No courses" body="Try another sport or clear the search." action="Clear" onAction={() => { setQuery(""); setSport(""); setLevel(""); }} />}
          {!list.loading && !list.error && visible.map((course) => {
            const enrollment = mine.find((item) => item.courseId === course.id);
            const progress = enrollment ? Math.round((enrollment.completedLessonIds.length / course.lessons.length) * 100) : undefined;
            return <CourseCard key={course.id} course={course} progress={progress} />;
          })}
        </div>
      </PullToRefresh>
    </Page>
  );
}

export function MyCoursesScreen() {
  const { athlete, enrollments } = useApp();
  const mine = courses.filter((course) => enrollments.some((item) => item.courseId === course.id && item.athleteId === athlete?.id));
  return (
    <Page title="My courses">
      {mine.length === 0 ? (
        <EmptyState title="No courses yet" body="Enroll from a course page. There is no payment step in this sample." to="/learn" action="Browse courses" />
      ) : (
        <div className="space-y-3">
          {mine.map((course) => {
            const enrollment = enrollments.find((item) => item.courseId === course.id && item.athleteId === athlete?.id);
            const progress = enrollment ? Math.round((enrollment.completedLessonIds.length / course.lessons.length) * 100) : 0;
            return <CourseCard key={course.id} course={course} progress={progress} />;
          })}
        </div>
      )}
    </Page>
  );
}

export function CourseScreen({ courseId }: { courseId: string }) {
  const course = courses.find((item) => item.id === courseId);
  const { athlete, enrollments, enroll, rateCourse } = useApp();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const enrollment = enrollments.find((item) => item.courseId === courseId && item.athleteId === athlete?.id);
  if (!course) return <Page title="Course"><EmptyState title="Course not found" body="That lesson path is not in the sample catalog." to="/learn" action="All courses" /></Page>;
  const progress = enrollment ? Math.round((enrollment.completedLessonIds.length / course.lessons.length) * 100) : 0;

  return (
    <div>
      <img src={courseImage(course.image)} alt="" className="h-52 w-full object-cover" />
      <Page title={course.title}>
        <p className="text-sm text-muted-foreground">{course.sport} · {course.category} · {course.level} · {course.minutes} min</p>
        <p className="mt-1 text-sm">Instructor {course.instructor} · sample</p>
        <p className="mt-4 text-sm leading-relaxed">{course.summary}</p>
        {enrollment && <div className="mt-4"><ProgressBar value={progress} label="Progress" /></div>}
        {!enrollment && (
          <Btn className="mt-4" full onClick={() => { enroll(course.id); toast("Enrolled on this device. No payment is collected."); }}>
            Enroll
          </Btn>
        )}
        <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Lessons</h2>
        <ol className="space-y-2">
          {course.lessons.map((lesson, index) => {
            const done = enrollment?.completedLessonIds.includes(lesson.id);
            return (
              <li key={lesson.id}>
                <Link to="/learn/$courseId/lessons/$lessonId" params={{ courseId: course.id, lessonId: lesson.id }} className="flex min-h-14 items-center justify-between rounded-2xl bg-card px-3 ring-1 ring-border">
                  <span>
                    <span className="block text-sm font-semibold">{index + 1}. {lesson.title}</span>
                    <span className="text-xs text-muted-foreground">{lesson.minutes} min{done ? " · Completed" : ""}</span>
                  </span>
                  <span aria-hidden>›</span>
                </Link>
              </li>
            );
          })}
        </ol>
        <h2 className="mb-3 mt-6 font-display text-lg font-semibold">Resources</h2>
        <ul className="space-y-2">
          {course.resources.map((resource) => (
            <li key={resource.name}>
              <button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={() => downloadText(resource.name, resource.body)}>
                Download {resource.name}
              </button>
            </li>
          ))}
        </ul>
        {enrollment && (
          <div className="mt-6">
            <p className="text-sm font-semibold">Rate this course</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" aria-label={`${value} star`} className={`size-11 rounded-full ${rating === value || enrollment.rating === value ? "bg-primary text-primary-foreground" : "bg-elevated"}`} onClick={() => setRating(value)}>
                  {value}
                </button>
              ))}
            </div>
            <textarea value={review || enrollment.review || ""} onChange={(event) => setReview(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl bg-elevated px-3 py-3 text-base ring-1 ring-border" placeholder="What was useful?" />
            <Btn className="mt-3" onClick={() => { rateCourse(course.id, rating || enrollment.rating || 0, review || enrollment.review || ""); toast("Rating saved on this device"); }}>Save rating</Btn>
          </div>
        )}
      </Page>
    </div>
  );
}

export function LessonScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const course = courses.find((item) => item.id === courseId);
  const lesson = course?.lessons.find((item) => item.id === lessonId);
  const { athlete, enrollments, enroll, setLessonProgress } = useApp();
  const enrollment = enrollments.find((item) => item.courseId === courseId && item.athleteId === athlete?.id);
  const [playing, setPlaying] = useState(false);
  const [value, setValue] = useState(enrollment?.progress[lessonId] ?? 0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setValue((current) => {
        const next = Math.min(100, current + 4);
        if (next >= 100) setPlaying(false);
        return next;
      });
    }, 400);
    return () => window.clearInterval(timer);
  }, [playing]);

  if (!course || !lesson) {
    return <Page title="Lesson"><EmptyState title="Lesson not found" body="Go back to the course." to="/learn" action="Courses" /></Page>;
  }

  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  const next = course.lessons[index + 1];

  return (
    <Page title={lesson.title}>
      <div className="overflow-hidden rounded-3xl bg-brand-dark text-white">
        <img src={courseImage(course.image)} alt="" className="h-44 w-full object-cover opacity-80" />
        <div className="space-y-3 p-4">
          <p className="text-sm text-white/80">Sample player · no video file is attached</p>
          <ProgressBar value={value} label={`${lesson.minutes} min lesson`} />
          <div className="flex gap-2">
            <Btn onClick={() => { if (!enrollment) enroll(course.id); setPlaying((flag) => !flag); }}>{playing ? "Pause" : "Play"}</Btn>
            <Btn variant="secondary" onClick={() => { setValue(100); setPlaying(false); setLessonProgress(course.id, lesson.id, 100); toast("Lesson marked complete"); }}>
              Mark complete
            </Btn>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{lesson.summary}</p>
      <Btn
        className="mt-4"
        variant="secondary"
        onClick={() => {
          if (!enrollment) enroll(course.id);
          setLessonProgress(course.id, lesson.id, value);
          toast("Progress saved");
          if (next) navigate({ to: "/learn/$courseId/lessons/$lessonId", params: { courseId: course.id, lessonId: next.id } });
        }}
      >
        {next ? "Save and next lesson" : "Save progress"}
      </Btn>
    </Page>
  );
}
