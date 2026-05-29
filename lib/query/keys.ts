export const queryKeys = {
  llmHealth: ["llm", "health"] as const,
  settings: ["settings"] as const,
  stravaStatus: ["strava", "status"] as const,
  activities: ["strava", "activities"] as const,
  activity: (id: string) => ["strava", "activities", id] as const,
  analysis: (id: string) => ["activities", id, "analysis"] as const
};
