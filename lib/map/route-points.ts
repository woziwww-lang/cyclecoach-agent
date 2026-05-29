import type { StravaActivityStream } from "@prisma/client";
import { decodePolyline } from "@/lib/map/polyline";

export type RoutePoint = [number, number];
export type RouteData = {
  points: RoutePoint[];
  source: "streams.latlng" | "summary_polyline" | "none";
  summaryPolylinePoints: number;
  streamLatLngPoints: number;
  hasSummaryPolyline: boolean;
};

export function getRoutePoints(input: { summaryPolyline?: string | null; stream?: Pick<StravaActivityStream, "streamsJson"> | null }): RoutePoint[] {
  return getRouteData(input).points;
}

export function getRouteData(input: { summaryPolyline?: string | null; stream?: Pick<StravaActivityStream, "streamsJson"> | null }): RouteData {
  const streamPoints = getLatLngPointsFromStream(input.stream?.streamsJson);
  const summaryPoints = input.summaryPolyline ? safeDecodePolyline(input.summaryPolyline) : [];
  if (streamPoints.length > 1) {
    return {
      points: streamPoints,
      source: "streams.latlng",
      summaryPolylinePoints: summaryPoints.length,
      streamLatLngPoints: streamPoints.length,
      hasSummaryPolyline: Boolean(input.summaryPolyline)
    };
  }
  if (summaryPoints.length > 1) {
    return {
      points: summaryPoints,
      source: "summary_polyline",
      summaryPolylinePoints: summaryPoints.length,
      streamLatLngPoints: streamPoints.length,
      hasSummaryPolyline: Boolean(input.summaryPolyline)
    };
  }
  return {
    points: [],
    source: "none",
    summaryPolylinePoints: summaryPoints.length,
    streamLatLngPoints: streamPoints.length,
    hasSummaryPolyline: Boolean(input.summaryPolyline)
  };
}

export function getLatLngPointsFromStream(streamsJson?: string | null): RoutePoint[] {
  if (!streamsJson) return [];
  try {
    const parsed = JSON.parse(streamsJson) as { latlng?: { data?: unknown[] } };
    const data = parsed.latlng?.data;
    if (!Array.isArray(data)) return [];
    return data
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const lat = Number(point[0]);
        const lng = Number(point[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return [lat, lng] as RoutePoint;
      })
      .filter(Boolean) as RoutePoint[];
  } catch {
    return [];
  }
}

function safeDecodePolyline(polyline: string) {
  try {
    return decodePolyline(polyline);
  } catch {
    return [];
  }
}
