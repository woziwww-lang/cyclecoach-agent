"use client";

import { create } from "zustand";

type Toast = {
  id: string;
  title: string;
  tone?: "info" | "success" | "error";
};

type AppStore = {
  language: string;
  mobileNavOpen: boolean;
  toasts: Toast[];
  setLanguage: (language: string) => void;
  setMobileNavOpen: (open: boolean) => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  language: "en",
  mobileNavOpen: false,
  toasts: [],
  setLanguage: (language) => set({ language }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
