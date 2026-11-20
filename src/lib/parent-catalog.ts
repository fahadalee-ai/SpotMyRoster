export const trainings = [
  {
    id: "tr-pitch",
    title: "Fall Pitching Camp",
    sport: "Baseball",
    kind: "Camp",
    place: "Oakland, CA",
    summary: "A camp for pitchers who want a repeatable warm-up and a clear plan between tournaments.",
  },
  {
    id: "tr-softball",
    title: "Summer Softball Camp",
    sport: "Softball",
    kind: "Camp",
    place: "Oakland, CA",
    summary: "Small-group softball work for athletes who already play and want cleaner fundamentals.",
  },
  {
    id: "tr-hoops",
    title: "Carter Hoops Training",
    sport: "Basketball",
    kind: "Private lesson",
    place: "Oakland, CA",
    summary: "One-to-one basketball training. Ball handling and spacing are the focus of this listing.",
  },
  {
    id: "tr-skills",
    title: "Summer Skills Camp - Ball Handling",
    sport: "Basketball",
    kind: "Camp",
    place: "Oakland, CA",
    summary: "A ball-handling camp listed in the athlete design under camps and lessons.",
  },
  {
    id: "tr-spring",
    title: "Spring Skills Camp",
    sport: "Baseball",
    kind: "Camp",
    place: "Fairview",
    summary: "A skills camp families can ask about from My Opportunities.",
  },
  {
    id: "tr-speed",
    title: "Speed & Agility Training",
    sport: "Multi-sport",
    kind: "Training",
    place: "Oakland, CA",
    summary: "Speed and agility work listed with the other camps and private lessons.",
  },
] as const;

export const tournaments = [
  {
    id: "tn-emerald",
    title: "Emerald City Spring Classic",
    sport: "Soccer",
    dates: "Apr 17–18, 2027",
    place: "Tukwila, WA",
    venue: "Starfire Sports Complex",
    summary: "Two days of regional competition, with brackets for boys and girls teams.",
  },
  {
    id: "tn-puget",
    title: "Puget Sound Cup",
    sport: "Soccer",
    dates: "May 22–24, 2027",
    place: "Redmond, WA",
    venue: "Marymoor Park",
    summary: "A weekend tournament. Confirm entry requirements with the organizer before you travel.",
  },
  {
    id: "tn-shootout",
    title: "Summer Shootout",
    sport: "Multi-sport",
    dates: "Jul 10–11, 2027",
    place: "Bellevue, WA",
    venue: "Sammamish High School",
    summary: "A summer weekend listing from the athlete tournament screens.",
  },
] as const;

export const parentPlan = {
  name: "Parent & Athlete Premium",
  price: "$9.99",
  period: "yearly",
  features: [
    "Highlighted athlete profile for coaches",
    "Priority placement in the directory",
    "Unlimited saved searches and alerts",
    "Choose email or text for alerts",
    "Instant email and text alerts for new teams",
    "Up to 3 athlete profiles on one parent account",
    "Direct messages to team organizers and coaches",
    "Tryout and event calendar",
  ],
};

export const statSports = [
  {
    sport: "Baseball",
    groups: [
      { title: "Batting", items: ["Home runs", "Batting average", "On-base percentage", "Slugging"] },
      { title: "Pitching", items: ["ERA", "Innings", "Walks", "Strikeouts"] },
      { title: "Fielding", items: ["Putouts", "Assists", "Errors", "Fielding percentage"] },
    ],
  },
  {
    sport: "Softball",
    groups: [
      { title: "Batting", items: ["Home runs", "Batting average", "On-base percentage"] },
      { title: "Fielding", items: ["Putouts", "Assists", "Errors"] },
    ],
  },
  {
    sport: "Soccer",
    groups: [
      { title: "Attacking", items: ["Goals", "Assists", "Shots", "Shots on target"] },
      { title: "Passing", items: ["Pass completion", "Key passes", "Possession"] },
    ],
  },
  {
    sport: "Basketball",
    groups: [{ title: "Scoring", items: ["Points", "Field goals made", "Field goals attempted", "Assists", "Rebounds"] }],
  },
  {
    sport: "Volleyball",
    groups: [{ title: "Attack", items: ["Kills", "Errors", "Total attacks", "Aces", "Digs"] }],
  },
] as const;
