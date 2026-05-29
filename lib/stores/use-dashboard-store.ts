"use client";

import { create } from "zustand";

type DashboardViewMode = "overview" | "detail";

type DashboardStore = {
  selectedActivityId: string | null;
  viewMode: DashboardViewMode;
  mapPanelOpen: boolean;
  analysisPanelOpen: boolean;
  setSelectedActivityId: (id: string | null) => void;
  setViewMode: (mode: DashboardViewMode) => void;
  setMapPanelOpen: (open: boolean) => void;
  setAnalysisPanelOpen: (open: boolean) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedActivityId: null,
  viewMode: "overview",
  mapPanelOpen: true,
  analysisPanelOpen: true,
  setSelectedActivityId: (id) => set({ selectedActivityId: id, viewMode: id ? "detail" : "overview" }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setMapPanelOpen: (open) => set({ mapPanelOpen: open }),
  setAnalysisPanelOpen: (open) => set({ analysisPanelOpen: open })
}));
