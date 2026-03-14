import { create } from "zustand";

export type ViewMode = "split" | "editor" | "preview";

interface UiStore {
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  exportSettingsOpen: boolean;
  toggleExportSettings: () => void;

  draftsOpen: boolean;
  toggleDrafts: () => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  splitRatio: 0.5,
  setSplitRatio: (ratio) => set({ splitRatio: ratio }),

  viewMode: "split",
  setViewMode: (mode) => set({ viewMode: mode }),

  exportSettingsOpen: false,
  toggleExportSettings: () => set((s) => ({ exportSettingsOpen: !s.exportSettingsOpen })),

  draftsOpen: false,
  toggleDrafts: () => set((s) => ({ draftsOpen: !s.draftsOpen })),
}));
