import { StatusPill } from "@/components/ui/status-pill";

export function EffortTypePill({ type }: { type: string }) {
  const tone = type === "recovery" || type === "endurance" ? "green" : type === "unknown" ? "slate" : "orange";
  return <StatusPill tone={tone}>{type}</StatusPill>;
}
