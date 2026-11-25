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
import northshoreOutfield from "@/assets/images/teams/northshore-outfield.jpg";
import northshorePitcher from "@/assets/images/teams/northshore-pitcher.jpg";
import harborSoftball from "@/assets/images/teams/harbor-softball.jpg";
import summitBasketball from "@/assets/images/teams/summit-basketball.jpg";
import piedmontSoccer from "@/assets/images/teams/piedmont-soccer.jpg";
import lakeshoreVolleyball from "@/assets/images/teams/lakeshore-volleyball.jpg";
import riverCityInfield from "@/assets/images/teams/river-city-infield.jpg";
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

const teamImages: Record<string, string> = {
  t1: northshoreOutfield,
  t2: harborSoftball,
  t3: summitBasketball,
  t4: piedmontSoccer,
  t5: lakeshoreVolleyball,
  t6: riverCityInfield,
};

const openingImages: Record<string, string> = {
  o1: northshoreOutfield,
  o2: northshorePitcher,
  o3: harborSoftball,
  o4: summitBasketball,
  o5: piedmontSoccer,
  o6: lakeshoreVolleyball,
  o7: riverCityInfield,
};

export function teamCover(id: string) {
  return teamImages[id] ?? northshoreOutfield;
}

export function openingCover(id: string) {
  return openingImages[id] ?? teamCover("t1");
}
