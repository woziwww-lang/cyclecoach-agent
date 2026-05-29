"use client";

import { create } from "zustand";

type ChatStore = {
  draft: string;
  activityId: string | null;
  setDraft: (draft: string) => void;
  setActivityId: (activityId: string | null) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  draft: "",
  activityId: null,
  setDraft: (draft) => set({ draft }),
  setActivityId: (activityId) => set({ activityId })
}));
