export class StravaClient {
  constructor(private readonly accessToken: string) {}

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`https://www.strava.com/api/v3${path}`, {
      headers: { authorization: `Bearer ${this.accessToken}` },
      cache: "no-store"
    });

    if (res.status === 429) throw new Error("STRAVA_RATE_LIMITED");
    if (res.status === 401) throw new Error("STRAVA_UNAUTHORIZED");
    if (res.status === 403) throw new Error("STRAVA_FORBIDDEN_OR_INSUFFICIENT_SCOPE");
    if (!res.ok) throw new Error(`STRAVA_API_ERROR:${res.status}`);

    return res.json();
  }

  listActivities(page = 1, perPage = 30) {
    return this.request<StravaActivitySummary[]>(`/athlete/activities?page=${page}&per_page=${perPage}`);
  }

  getActivity(stravaId: string) {
    return this.request<StravaActivityDetail>(`/activities/${stravaId}`);
  }

  getActivityStreams(stravaId: string) {
    const keys = [
      "time",
      "latlng",
      "distance",
      "altitude",
      "velocity_smooth",
      "heartrate",
      "cadence",
      "watts",
      "temp",
      "moving",
      "grade_smooth"
    ].join(",");

    return this.request<Record<string, { data: unknown[]; series_type: string; original_size: number }>>(
      `/activities/${stravaId}/streams?keys=${keys}&key_by_type=true`
    );
  }
}

export type StravaActivitySummary = {
  id: number;
  name: string;
  type?: string;
  sport_type?: string;
  start_date: string;
  timezone?: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  average_cadence?: number;
  calories?: number;
  map?: { summary_polyline?: string };
};

export type StravaActivityDetail = StravaActivitySummary & {
  description?: string;
  perceived_exertion?: number;
};
