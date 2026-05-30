import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";

type CatalogRoute = Omit<RouteCandidate, "id" | "source" | "distanceKm" | "elevationM" | "durationMinutes" | "polyline" | "basedOnActivityId" | "score" | "scoreReasons"> & {
  routeId: string;
  distanceKmRange: [number, number];
  elevationMRange: [number, number];
};

const catalog: CatalogRoute[] = [
  {
    routeId: "tamagawa-endurance",
    name: "Tamagawa Endurance Course",
    region: "Tokyo / Kanagawa",
    routeType: "flat",
    distanceKmRange: [40, 90],
    elevationMRange: [50, 300],
    difficulty: "easy",
    suitableGoals: ["endurance", "recovery", "fat_loss", "long_ride"],
    notes: "Flat riverside riding suitable for steady endurance work and low-risk aerobic volume.",
    safetyNotes: ["Watch for pedestrians and narrow sections on weekends.", "Keep speed controlled near shared-use path sections."]
  },
  {
    routeId: "arakawa-flat-endurance",
    name: "Arakawa Flat Endurance Course",
    region: "Tokyo / Saitama",
    routeType: "flat",
    distanceKmRange: [45, 100],
    elevationMRange: [40, 250],
    difficulty: "easy",
    suitableGoals: ["endurance", "fat_loss", "long_ride", "recovery"],
    notes: "A flat river route for uninterrupted endurance pacing when you want fewer climbs.",
    safetyNotes: ["Check wind direction before committing to long out-and-back sections.", "Avoid crowded times if you need steady pacing."]
  },
  {
    routeId: "oi-futo-loop",
    name: "Oi Futo Loop",
    region: "Tokyo Bay",
    routeType: "recovery",
    distanceKmRange: [20, 60],
    elevationMRange: [0, 120],
    difficulty: "easy",
    suitableGoals: ["recovery", "endurance", "fat_loss"],
    notes: "A repeatable flat loop for short controlled sessions and recovery spins.",
    safetyNotes: ["Expect industrial traffic around access roads.", "Keep recovery rides genuinely easy."]
  },
  {
    routeId: "tomin-no-mori-climb",
    name: "Tomin no Mori Climb",
    region: "West Tokyo",
    routeType: "climbing",
    distanceKmRange: [60, 120],
    elevationMRange: [800, 1800],
    difficulty: "hard",
    suitableGoals: ["climbing", "long_ride"],
    notes: "A classic climbing-focused ride for fresh legs, stable weather, and proper fueling.",
    safetyNotes: ["Avoid if tired, under-fueled, or weather is unstable.", "Descending demands attention; do not chase speed."]
  },
  {
    routeId: "yabitsu-pass-climb",
    name: "Yabitsu Pass Climb",
    region: "Kanagawa",
    routeType: "climbing",
    distanceKmRange: [50, 110],
    elevationMRange: [700, 1600],
    difficulty: "hard",
    suitableGoals: ["climbing", "long_ride"],
    notes: "A well-known climb option when the goal is sustained climbing work.",
    safetyNotes: ["Use this only when fresh enough for climbing and descending.", "Check road and weather conditions before departure."]
  },
  {
    routeId: "wada-pass-climb",
    name: "Wada Pass Climb",
    region: "West Tokyo / Kanagawa",
    routeType: "climbing",
    distanceKmRange: [45, 95],
    elevationMRange: [700, 1500],
    difficulty: "hard",
    suitableGoals: ["climbing"],
    notes: "A punchier climbing route for focused hill strength, not a recovery option.",
    safetyNotes: ["Avoid after a heavy training week.", "Use conservative gearing and leave margin on descents."]
  },
  {
    routeId: "tama-hills-rolling",
    name: "Tama Hills Rolling Route",
    region: "West Tokyo",
    routeType: "rolling",
    distanceKmRange: [35, 80],
    elevationMRange: [400, 1000],
    difficulty: "moderate",
    suitableGoals: ["endurance", "climbing", "ftp"],
    notes: "Rolling terrain for mixed endurance and controlled tempo without committing to a major mountain ride.",
    safetyNotes: ["Avoid turning rolling terrain into repeated maximal surges.", "Keep intersections and descents controlled."]
  }
];

export function getRouteCatalog(): RouteCandidate[] {
  return catalog.map((route) => ({
    id: route.routeId,
    name: route.name,
    source: "route_catalog",
    region: route.region,
    routeType: route.routeType,
    distanceKm: average(route.distanceKmRange),
    elevationM: average(route.elevationMRange),
    durationMinutes: null,
    difficulty: route.difficulty,
    suitableGoals: route.suitableGoals,
    polyline: null,
    basedOnActivityId: null,
    safetyNotes: route.safetyNotes,
    notes: route.notes,
    score: 0,
    scoreReasons: []
  }));
}

function average(range: [number, number]) {
  return Math.round((range[0] + range[1]) / 2);
}
