import logo from "@/img/logo.png";
import logoMark from "@/assets/images/branding/logo-mark.png";
import logoOnDark from "@/assets/images/branding/logo-on-dark.png";
import discover from "@/assets/images/onboarding/discover.jpg";
import skills from "@/assets/images/onboarding/skills.jpg";
import apply from "@/assets/images/onboarding/apply.jpg";
import learn from "@/assets/images/onboarding/learn.jpg";
import banner from "@/assets/images/banners/home.jpg";
import approach from "@/assets/images/courses/approach.jpg";
import court from "@/assets/images/courses/court.jpg";
import empty from "@/assets/images/empty-states/roster.jpg";
import type { Course } from "@/lib/types";

export const images = {
  logo,
  logoMark,
  logoOnDark,
  discover,
  skills,
  apply,
  learn,
  banner,
  approach,
  court,
  empty,
};

const courseImages: Record<Course["image"], string> = {
  approach,
  discover,
  learn,
  court,
  skills,
};

export function courseImage(key: Course["image"]) {
  return courseImages[key];
}

export function teamCover(id: string) {
  const pool = [banner, approach, court, discover, skills];
  let n = 0;
  for (const ch of id) n += ch.charCodeAt(0);
  return pool[n % pool.length] ?? banner;
}
