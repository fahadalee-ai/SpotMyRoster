export type AthleteProfile = {
  id: string;
  firstName: string;
  lastName: string;
  ageGroup: string;
  sport: string;
  positions: string;
  school: string;
  bats: string;
  throws: string;
  height: string;
  gpa: string;
  skill: string;
  lookingToSub: boolean;
  facebook: string;
  instagram: string;
  recruiting: string;
  highlights: { id: string; name: string; src?: string }[];
};

export type StatCell = { label: string; value: string };
export type StatSheet = { id: string; label: string; stats: StatCell[] };

const KEY = "smr-my-athletes";

export const emmaProfile: AthleteProfile = {
  id: "emma",
  firstName: "Emma",
  lastName: "Davis",
  ageGroup: "U14",
  sport: "Softball",
  positions: "Pitcher",
  school: "Maple Grove Middle School",
  bats: "Right",
  throws: "Right",
  height: "5'4\"",
  gpa: "3.8",
  skill: "Travel",
  lookingToSub: true,
  facebook: "emma.davis.athlete",
  instagram: "@emmadavis_athlete",
  recruiting: "emma-davis-123",
  highlights: [
    { id: "swing", name: "Swing" },
    { id: "field", name: "Infield" },
    { id: "pitch", name: "Pitching" },
  ],
};

const sheet = (id: string, label: string, pairs: [string, string][]): StatSheet => ({
  id,
  label,
  stats: pairs.map(([statLabel, value]) => ({ label: statLabel, value })),
});

export const statSheets: Record<string, StatSheet[]> = {
  Softball: [
    sheet("batting", "Batting Stats", [["AVG", ".325"], ["OBP", ".410"], ["SLG", ".560"], ["OPS", ".970"], ["HR", "24"], ["RBI", "76"], ["SB", "18"], ["H", "48"]]),
    sheet("pitching", "Pitching Stats", [["ERA", "2.15"], ["IP", "84.1"], ["SO", "112"], ["BB", "28"], ["WHIP", "1.08"], ["W", "12"], ["L", "3"], ["H", "71"]]),
    sheet("fielding", "Fielding Stats", [["PO", "94"], ["A", "38"], ["E", "3"], ["FLD%", ".978"], ["DP", "7"], ["CS", "12"], ["TC", "135"], ["INN", "210"]]),
  ],
  Baseball: [
    sheet("batting", "Batting Stats", [["AVG", ".301"], ["OBP", ".382"], ["SLG", ".498"], ["OPS", ".880"], ["HR", "9"], ["RBI", "41"], ["SB", "14"], ["H", "52"]]),
    sheet("pitching", "Pitching Stats", [["ERA", "3.42"], ["IP", "61.2"], ["SO", "68"], ["BB", "22"], ["WHIP", "1.24"], ["W", "6"], ["L", "4"], ["H", "58"]]),
    sheet("fielding", "Fielding Stats", [["PO", "71"], ["A", "88"], ["E", "6"], ["FLD%", ".964"], ["DP", "11"], ["CS", "4"], ["TC", "165"], ["INN", "188"]]),
  ],
  Soccer: [
    sheet("attacking", "Attacking", [["G", "11"], ["A", "7"], ["SH", "46"], ["SOT", "22"], ["GWG", "4"], ["PKG", "1"]]),
    sheet("passing", "Passing", [["CMP%", "78"], ["KEY", "19"], ["CRS", "14"], ["LB", "6"], ["TB", "3"], ["PASS", "412"]]),
    sheet("defense", "Defense", [["TKL", "34"], ["INT", "21"], ["CLR", "18"], ["BLK", "6"], ["REC", "9"], ["YC", "2"]]),
  ],
  Basketball: [
    sheet("scoring", "Scoring", [["PPG", "14.2"], ["FG%", "46"], ["3P%", "34"], ["FT%", "78"], ["PTS", "312"], ["FGM", "118"]]),
    sheet("playmaking", "Playmaking", [["APG", "3.6"], ["AST", "79"], ["TO", "41"], ["AST/TO", "1.9"], ["STL", "28"], ["BLK", "9"]]),
    sheet("rebounding", "Rebounding", [["RPG", "6.1"], ["OREB", "38"], ["DREB", "96"], ["REB", "134"], ["PF", "42"], ["MIN", "24.5"]]),
  ],
  Football: [
    sheet("passing", "Passing", [["CMP", "98"], ["ATT", "162"], ["YDS", "1,284"], ["TD", "12"], ["INT", "4"], ["RTG", "96.4"]]),
    sheet("rushing", "Rushing", [["CAR", "74"], ["YDS", "412"], ["AVG", "5.6"], ["TD", "5"], ["LNG", "38"], ["FUM", "1"]]),
    sheet("receiving", "Receiving", [["REC", "22"], ["YDS", "310"], ["AVG", "14.1"], ["TD", "3"], ["LNG", "46"], ["TGTS", "34"]]),
  ],
  Volleyball: [
    sheet("attack", "Attack", [["K", "186"], ["E", "42"], ["TA", "410"], ["HIT%", ".351"], ["PTS", "214"], ["ACE", "28"]]),
    sheet("setting", "Setting", [["A", "312"], ["ATTEMPTS", "348"], ["AST%", "41"], ["BL", "0"], ["SA", "18"], ["SE", "6"]]),
    sheet("defense", "Defense", [["DIG", "164"], ["RCV", "210"], ["BLK", "22"], ["BA", "48"], ["BE", "9"], ["BHE", "4"]]),
  ],
  "Track and Field": [
    sheet("sprints", "Sprints", [["100", "12.84"], ["200", "26.10"], ["400", "61.40"], ["4x100", "51.20"], ["SB 100", "12.84"], ["MEETS", "8"]]),
    sheet("distance", "Distance", [["800", "2:28.4"], ["1600", "5:42.1"], ["3200", "12:18"], ["XC 5K", "21:06"], ["PR 800", "2:26.9"], ["MEETS", "6"]]),
    sheet("field", "Field events", [["LJ", "15'4\""], ["HJ", "4'8\""], ["SP", "28'2\""], ["DT", "72'0\""], ["TJ", "32'1\""], ["MEETS", "7"]]),
  ],
  Lacrosse: [
    sheet("offense", "Offense", [["G", "18"], ["A", "11"], ["PTS", "29"], ["SH", "52"], ["SOG", "31"], ["GB", "24"]]),
    sheet("faceoff", "Faceoff", [["FW", "64"], ["FL", "41"], ["FO%", "61"], ["GB", "38"], ["TO", "12"], ["CT", "9"]]),
    sheet("defense", "Defense", [["CT", "17"], ["GB", "29"], ["DC", "8"], ["TO", "6"], ["CLR", "22"], ["SV", "0"]]),
  ],
  "Ice Hockey": [
    sheet("scoring", "Scoring", [["G", "9"], ["A", "14"], ["PTS", "23"], ["SOG", "61"], ["PPG", "2"], ["GWG", "3"]]),
    sheet("skating", "Skating", [["GP", "28"], ["TOI", "16:40"], ["SHFT", "18.2"], ["HITS", "22"], ["BLK", "11"], ["TK", "19"]]),
    sheet("goalie", "Goalie", [["SV%", ".912"], ["GAA", "2.48"], ["SV", "214"], ["GA", "28"], ["SO", "1"], ["W", "8"]]),
  ],
};

export function sheetsFor(sport: string) {
  return statSheets[sport] ?? statSheets.Softball;
}

type Saved = { activeId: string; athletes: AthleteProfile[] };

export function loadAthletes(): Saved {
  if (typeof window === "undefined") return { activeId: emmaProfile.id, athletes: [emmaProfile] };
  const raw = localStorage.getItem(KEY);
  if (!raw) return { activeId: emmaProfile.id, athletes: [emmaProfile] };
  try {
    const parsed = JSON.parse(raw) as Saved;
    if (!Array.isArray(parsed.athletes) || parsed.athletes.length === 0) return { activeId: emmaProfile.id, athletes: [emmaProfile] };
    const athletes = parsed.athletes.map((item) => ({ ...emmaProfile, ...item, highlights: item.highlights?.length ? item.highlights : emmaProfile.highlights }));
    const activeId = athletes.some((item) => item.id === parsed.activeId) ? parsed.activeId : athletes[0].id;
    return { activeId, athletes };
  } catch {
    return { activeId: emmaProfile.id, athletes: [emmaProfile] };
  }
}

export function saveAthletes(saved: Saved) {
  localStorage.setItem(KEY, JSON.stringify(saved));
}
