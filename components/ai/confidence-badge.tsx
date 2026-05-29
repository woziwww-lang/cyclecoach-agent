import { StatusPill } from "@/components/ui/status-pill";

export function ConfidenceBadge({ level }: { level: string }) {
  const tone = level === "high" ? "green" : level === "medium" ? "orange" : "red";
  return <StatusPill tone={tone}>{level} confidence</StatusPill>;
}
