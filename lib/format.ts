export function formatDistanceKm(meters?: number | null) {
  if (meters == null) return "No distance";
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds?: number | null) {
  if (seconds == null) return "No time";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatSpeedKph(mps?: number | null) {
  if (mps == null) return "No speed";
  return `${(mps * 3.6).toFixed(1)} km/h`;
}
