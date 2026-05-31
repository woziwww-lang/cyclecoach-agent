import { getTokyoKantoRouteCatalog } from "@/features/routes/data/tokyo-kanto-route-catalog";
import type { RouteCandidate } from "@/features/agent/schemas/route-candidate.schema";

export function getRouteCatalog(): RouteCandidate[] {
  return getTokyoKantoRouteCatalog();
}
