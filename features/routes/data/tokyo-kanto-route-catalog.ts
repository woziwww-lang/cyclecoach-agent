import type { PlannerGoal, RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";
import type { RouteType } from "@/features/agent/schemas/training-memory.schema";

type CatalogRoute = {
  routeId: string;
  name: string;
  region: string;
  routeType: RouteType;
  distanceKmRange: [number, number];
  elevationMRange: [number, number];
  recommendedDurationMinutes: [number, number];
  difficulty: RouteCandidate["difficulty"];
  suitableGoals: PlannerGoal[];
  surfaceNotes: string[];
  trafficNotes: string[];
  safetyNotes: string[];
  trainingUse: string;
  mapPolyline?: string | null;
};

const catalog: CatalogRoute[] = [
  {
    routeId: "tamagawa-endurance",
    name: "Tamagawa Endurance Course",
    region: "Tokyo / Kanagawa",
    routeType: "flat",
    distanceKmRange: [40, 90],
    elevationMRange: [50, 300],
    recommendedDurationMinutes: [90, 210],
    difficulty: "easy",
    suitableGoals: ["endurance", "recovery", "fat_loss", "long_ride"],
    surfaceNotes: ["Mostly riverside path and connecting local roads."],
    trafficNotes: ["Shared-use path can be crowded on weekends."],
    safetyNotes: ["Keep speed controlled around pedestrians.", "Watch narrow sections near bridges."],
    trainingUse: "A steady flat route for aerobic volume, fat-loss rides, and low-stress endurance pacing."
  },
  {
    routeId: "arakawa-flat-endurance",
    name: "Arakawa Flat Endurance Course",
    region: "Tokyo / Saitama",
    routeType: "flat",
    distanceKmRange: [45, 100],
    elevationMRange: [40, 250],
    recommendedDurationMinutes: [100, 240],
    difficulty: "easy",
    suitableGoals: ["endurance", "fat_loss", "long_ride", "recovery"],
    surfaceNotes: ["Flat riverside riding with long uninterrupted sections."],
    trafficNotes: ["Wind exposure can make one direction harder than expected."],
    safetyNotes: ["Check wind before a long out-and-back.", "Avoid crowded times for steady pacing."],
    trainingUse: "Best for controlled endurance and long Z2 rides without navigation complexity."
  },
  {
    routeId: "oi-futo-loop",
    name: "Oi Futo Loop",
    region: "Tokyo Bay",
    routeType: "interval_loop",
    distanceKmRange: [20, 60],
    elevationMRange: [0, 120],
    recommendedDurationMinutes: [45, 120],
    difficulty: "easy",
    suitableGoals: ["recovery", "endurance", "fat_loss", "sprint", "ftp"],
    surfaceNotes: ["Repeatable flat loop."],
    trafficNotes: ["Industrial access roads can have trucks."],
    safetyNotes: ["Keep efforts controlled near intersections.", "Do not use traffic gaps as sprint targets."],
    trainingUse: "A repeatable low-navigation loop for recovery, cadence work, and short structured efforts."
  },
  {
    routeId: "tomin-no-mori-climb",
    name: "Tomin no Mori Climb",
    region: "West Tokyo",
    routeType: "climbing",
    distanceKmRange: [60, 120],
    elevationMRange: [800, 1800],
    recommendedDurationMinutes: [180, 360],
    difficulty: "hard",
    suitableGoals: ["climbing", "long_ride", "route_exploration"],
    surfaceNotes: ["Mountain roads and sustained climbing."],
    trafficNotes: ["Weather and traffic can change quickly in mountain sections."],
    safetyNotes: ["Avoid when tired or under-fueled.", "Leave margin for descending."],
    trainingUse: "A classic climbing-focused ride for fresh legs and proper fueling."
  },
  {
    routeId: "yabitsu-pass-climb",
    name: "Yabitsu Pass Climb",
    region: "Kanagawa",
    routeType: "climbing",
    distanceKmRange: [50, 110],
    elevationMRange: [700, 1600],
    recommendedDurationMinutes: [150, 330],
    difficulty: "hard",
    suitableGoals: ["climbing", "long_ride"],
    surfaceNotes: ["Sustained pass climbing and descending."],
    trafficNotes: ["Road conditions and descending visibility matter."],
    safetyNotes: ["Use only when fresh enough for climbing and descending.", "Check conditions before departure."],
    trainingUse: "Useful for sustained climbing strength and pacing practice."
  },
  {
    routeId: "wada-pass-climb",
    name: "Wada Pass Climb",
    region: "West Tokyo / Kanagawa",
    routeType: "climbing",
    distanceKmRange: [45, 95],
    elevationMRange: [700, 1500],
    recommendedDurationMinutes: [150, 300],
    difficulty: "hard",
    suitableGoals: ["climbing"],
    surfaceNotes: ["Steeper climbing focus."],
    trafficNotes: ["Narrow roads require attention."],
    safetyNotes: ["Avoid after a heavy week.", "Use conservative gearing and leave margin."],
    trainingUse: "A sharper climbing option for hill strength, not a recovery ride."
  },
  {
    routeId: "tama-hills-rolling",
    name: "Tama Hills Rolling Route",
    region: "West Tokyo",
    routeType: "rolling",
    distanceKmRange: [35, 80],
    elevationMRange: [400, 1000],
    recommendedDurationMinutes: [90, 220],
    difficulty: "moderate",
    suitableGoals: ["endurance", "climbing", "ftp", "tempo"],
    surfaceNotes: ["Rolling suburban roads."],
    trafficNotes: ["Stop-and-go sections can interrupt tempo work."],
    safetyNotes: ["Avoid turning every roller into a surge.", "Keep intersections and descents controlled."],
    trainingUse: "Mixed endurance and controlled tempo without a major mountain commitment."
  },
  {
    routeId: "miura-peninsula-long-ride",
    name: "Miura Peninsula Long Ride",
    region: "Kanagawa",
    routeType: "mixed",
    distanceKmRange: [80, 140],
    elevationMRange: [500, 1300],
    recommendedDurationMinutes: [240, 420],
    difficulty: "moderate",
    suitableGoals: ["long_ride", "endurance", "route_exploration"],
    surfaceNotes: ["Coastal and rolling road mix."],
    trafficNotes: ["Coastal traffic and wind can affect pacing."],
    safetyNotes: ["Plan fueling stops.", "Avoid chasing speed on exposed coastal sections."],
    trainingUse: "A durability ride for long-distance pacing, fueling practice, and route confidence."
  },
  {
    routeId: "onekan-tama-new-town",
    name: "Onekan / Tama New Town Rolling Course",
    region: "West Tokyo",
    routeType: "rolling",
    distanceKmRange: [30, 75],
    elevationMRange: [350, 900],
    recommendedDurationMinutes: [75, 180],
    difficulty: "moderate",
    suitableGoals: ["tempo", "ftp", "climbing", "endurance"],
    surfaceNotes: ["Rolling road sections with repeatable climbs."],
    trafficNotes: ["Urban edges and intersections require patience."],
    safetyNotes: ["Do not force intervals through lights or traffic.", "Keep descents tidy."],
    trainingUse: "Good for tempo discipline, repeatable rollers, and short climbing strength."
  }
];

export function getTokyoKantoRouteCatalog(): RouteCandidate[] {
  return catalog.map((route) => ({
    id: route.routeId,
    name: route.name,
    source: "route_catalog",
    provider: "catalog",
    region: route.region,
    routeType: route.routeType,
    distanceKm: average(route.distanceKmRange),
    elevationM: average(route.elevationMRange),
    durationMinutes: average(route.recommendedDurationMinutes),
    difficulty: route.difficulty,
    suitableGoals: route.suitableGoals,
    polyline: route.mapPolyline ?? null,
    mapPreviewAvailable: Boolean(route.mapPolyline),
    routeUrl: null,
    basedOnActivityId: null,
    safetyNotes: [...route.safetyNotes, ...route.trafficNotes],
    notes: `${route.trainingUse} ${route.surfaceNotes.join(" ")}`,
    score: 0,
    scoreReasons: []
  }));
}

function average(range: [number, number]) {
  return Math.round((range[0] + range[1]) / 2);
}
