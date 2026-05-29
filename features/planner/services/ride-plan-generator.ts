import type { RecentTrainingSummary, RidePlan, RidePlanInput } from "@/features/planner/schemas/ride-plan.schema";

const defaultSummary: RecentTrainingSummary = {
  hasData: false,
  latestRideName: null,
  latestRideDate: null,
  sevenDayDistanceKm: 0,
  sevenDayElevationM: 0,
  sevenDayMovingHours: 0,
  possibleHighIntensity: false
};

export function generateRidePlan(input: RidePlanInput, recent: RecentTrainingSummary | null = null): RidePlan {
  const summary = recent ?? defaultSummary;
  const shouldRecover = input.readiness === "tired" || (summary.hasData && summary.sevenDayMovingHours >= 8 && summary.possibleHighIntensity);
  const duration = shouldRecover ? Math.min(input.durationMinutes, 60) : input.durationMinutes;
  const warmup = Math.min(15, Math.max(8, Math.round(duration * 0.18)));
  const cooldown = Math.min(12, Math.max(6, Math.round(duration * 0.12)));
  const mainDuration = Math.max(10, duration - warmup - cooldown);

  if (shouldRecover) {
    return withConfidence(input, summary, {
      title: "Recovery-first ride",
      rideType: input.readiness === "tired" && input.durationMinutes <= 30 ? "rest" : "recovery",
      durationMinutes: duration,
      intensity: "easy",
      routeType: "Flat, familiar, low-traffic loop",
      warmup: { durationMinutes: warmup, description: "Start very easy and keep cadence comfortable." },
      mainSet: [
        {
          title: "Easy spin",
          durationMinutes: mainDuration,
          intensity: "Conversational easy",
          description: "Stay relaxed. If the legs feel worse after 15 minutes, turn this into a rest day."
        }
      ],
      cooldown: { durationMinutes: cooldown, description: "Roll home easy and avoid any sprinting." },
      nutrition: ["Water is enough for short easy rides; add electrolytes if it is hot.", "Eat normally after the ride rather than forcing a large fueling plan."],
      recovery: ["Prioritize sleep tonight.", "Keep the next hard session at least 24 hours away if fatigue persists."],
      safetyNotes: ["Avoid busy roads if focus feels low.", "This is training guidance, not medical advice."],
      coachSummary: "You look better served by recovery than intensity today. Keep it easy, short, and controlled.",
      confidence: { level: "medium", reason: "Recovery recommendation is based on readiness and recent training signals where available." }
    });
  }

  const planByGoal: Record<RidePlanInput["goal"], Omit<RidePlan, "confidence">> = {
    recovery: {
      title: "Easy recovery spin",
      rideType: "recovery",
      durationMinutes: duration,
      intensity: "easy",
      routeType: "Flat local loop",
      warmup: { durationMinutes: warmup, description: "Ease into the ride with light pressure on the pedals." },
      mainSet: [{ title: "Relaxed aerobic riding", durationMinutes: mainDuration, intensity: "Easy", description: "Keep breathing calm and effort conversational." }],
      cooldown: { durationMinutes: cooldown, description: "Finish with a smooth spin." },
      nutrition: ["Bring water.", "No aggressive fueling needed unless the ride runs long or conditions are hot."],
      recovery: ["Light mobility after the ride.", "Stop early if fatigue rises."],
      safetyNotes: ["Choose predictable roads.", "This is training guidance, not medical advice."],
      coachSummary: "Use this as a low-stress ride that supports recovery without adding much fatigue.",
      fallbackUsed: false
    },
    endurance: {
      title: "Steady Z2 endurance ride",
      rideType: "endurance",
      durationMinutes: duration,
      intensity: "moderate",
      routeType: "Rolling route with few interruptions",
      warmup: { durationMinutes: warmup, description: "Build gradually from easy to steady endurance effort." },
      mainSet: [{ title: "Continuous endurance block", durationMinutes: mainDuration, intensity: "Easy to moderate", description: "Hold a smooth pace you could sustain while speaking in short sentences." }],
      cooldown: { durationMinutes: cooldown, description: "Back off until breathing is easy." },
      nutrition: ["For rides over 75 minutes, take carbohydrates during the ride.", "Drink regularly; add electrolytes in heat."],
      recovery: ["Eat a normal meal with protein and carbohydrates.", "Track how the legs feel tomorrow."],
      safetyNotes: ["Prefer low-stop routes to keep effort steady.", "This is training guidance, not medical advice."],
      coachSummary: "A steady endurance ride is the best use of this session: controlled, repeatable, and useful for aerobic fitness.",
      fallbackUsed: false
    },
    climbing: {
      title: "Climbing strength-endurance ride",
      rideType: "climbing",
      durationMinutes: duration,
      intensity: "moderate",
      routeType: "Short hill repeats or rolling climbs",
      warmup: { durationMinutes: warmup, description: "Warm up on flat roads before the first climb." },
      mainSet: [{ title: "Controlled climb repeats", durationMinutes: mainDuration, intensity: "Moderate", description: "Ride climbs seated and controlled. Descend easy between efforts." }],
      cooldown: { durationMinutes: cooldown, description: "Spin easy on flat roads after the last climb." },
      nutrition: ["Bring water and a small carb source if the ride exceeds 60 minutes.", "Avoid starting climbs under-fueled."],
      recovery: ["Stretch hips and calves lightly.", "Keep tomorrow easy if the climbing load is new."],
      safetyNotes: ["Avoid technical descents when tired.", "This is training guidance, not medical advice."],
      coachSummary: "Make the climbing work controlled rather than maximal. The goal is repeatable strength-endurance, not a race effort.",
      fallbackUsed: false
    },
    ftp: {
      title: "Tempo control session",
      rideType: "tempo",
      durationMinutes: duration,
      intensity: "hard",
      routeType: "Flat or gentle rolling route",
      warmup: { durationMinutes: warmup, description: "Warm up progressively and include a few short cadence changes." },
      mainSet: buildTempoBlocks(mainDuration),
      cooldown: { durationMinutes: cooldown, description: "Ride easy until breathing and legs settle." },
      nutrition: ["Eat before the ride.", "For 90 minutes or more, take carbohydrates during the session."],
      recovery: ["Avoid stacking another hard ride tomorrow.", "Refuel soon after finishing."],
      safetyNotes: ["Do not do hard intervals in traffic.", "This is training guidance, not medical advice."],
      coachSummary: "This is a controlled tempo session. It should feel focused, not all-out, and it should finish with one more effort left in reserve.",
      fallbackUsed: false
    },
    fat_loss: {
      title: "Consistent aerobic calorie-burn ride",
      rideType: "endurance",
      durationMinutes: duration,
      intensity: "moderate",
      routeType: "Safe steady loop",
      warmup: { durationMinutes: warmup, description: "Start easy and avoid early surges." },
      mainSet: [{ title: "Steady aerobic block", durationMinutes: mainDuration, intensity: "Easy to moderate", description: "Keep effort sustainable. Consistency matters more than intensity." }],
      cooldown: { durationMinutes: cooldown, description: "Finish easy." },
      nutrition: ["Do not start under-fueled.", "Hydrate normally; keep post-ride eating controlled and protein-forward."],
      recovery: ["Repeatable weekly volume beats one heroic ride.", "Sleep and daily food quality matter for body composition."],
      safetyNotes: ["Avoid chasing calorie numbers in unsafe conditions.", "This is training guidance, not medical advice."],
      coachSummary: "For fat loss, keep this ride repeatable and aerobic. The win is sustainable volume, not punishment.",
      fallbackUsed: false
    },
    long_ride: {
      title: "Weekend long endurance ride",
      rideType: "long_ride",
      durationMinutes: Math.max(duration, 90),
      intensity: "moderate",
      routeType: "Familiar endurance route with bailout options",
      warmup: { durationMinutes: warmup, description: "Use the first segment to settle into rhythm." },
      mainSet: [{ title: "Long steady endurance", durationMinutes: Math.max(mainDuration, 70), intensity: "Easy to moderate", description: "Keep the first half deliberately easy and avoid late fade." }],
      cooldown: { durationMinutes: cooldown, description: "Back off for the final minutes." },
      nutrition: ["Plan carbs and fluids before leaving.", "Bring more water than you expect to need, especially if resupply is uncertain."],
      recovery: ["Eat soon after finishing.", "Keep the next session easy if legs feel heavy."],
      safetyNotes: ["Check weather and daylight before departure.", "This is training guidance, not medical advice."],
      coachSummary: "Treat this as durability work. Keep it smooth, fuel early, and finish feeling like you could ride a little farther.",
      fallbackUsed: false
    }
  };

  return withConfidence(input, summary, planByGoal[input.goal]);
}

function buildTempoBlocks(minutes: number) {
  if (minutes < 35) {
    return [{ title: "Short tempo block", durationMinutes: minutes, intensity: "Moderate-hard", description: "Hold a firm but controlled pace without sprinting." }];
  }
  const block = Math.floor((minutes - 8) / 2);
  return [
    { title: "Tempo block 1", durationMinutes: block, intensity: "Moderate-hard", description: "Steady pressure, smooth cadence." },
    { title: "Easy reset", durationMinutes: 8, intensity: "Easy", description: "Spin easy and reset breathing." },
    { title: "Tempo block 2", durationMinutes: block, intensity: "Moderate-hard", description: "Match the first block without forcing the finish." }
  ];
}

function withConfidence(input: RidePlanInput, recent: RecentTrainingSummary, plan: Omit<RidePlan, "confidence"> | RidePlan): RidePlan {
  const hasPersonalization = input.useLatestRideContext && recent.hasData;
  return {
    ...plan,
    confidence: "confidence" in plan
      ? plan.confidence
      : {
          level: hasPersonalization ? "medium" : "low",
          reason: hasPersonalization
            ? `Uses your selected inputs plus recent activity context${recent.latestRideName ? `, including ${recent.latestRideName}` : ""}.`
            : "No recent Strava context was used, so this is based on your manual inputs only."
        }
  };
}
