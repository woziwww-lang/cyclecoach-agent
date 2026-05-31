import { getTokyoKantoRouteCatalog } from "@/features/routes/data/tokyo-kanto-route-catalog";
import type { RouteProvider } from "@/features/routes/providers/route-provider.types";

export const routeCatalogProvider: RouteProvider = {
  id: "catalog",
  name: "Tokyo/Kanto route catalog",
  async isAvailable() {
    return true;
  },
  async findCandidates() {
    return getTokyoKantoRouteCatalog();
  }
};
