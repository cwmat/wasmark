import { create } from "zustand";
import type { ExportSettings, ExportStatus } from "@/types/export";

interface ExportStore {
  settings: ExportSettings;
  updateSettings: (partial: Partial<ExportSettings>) => void;

  status: ExportStatus;
  setStatus: (status: ExportStatus) => void;

  errorMessage: string | null;
  setError: (message: string | null) => void;
}

export const useExportStore = create<ExportStore>()((set) => ({
  settings: {
    pageSize: "a4",
    marginMm: 25,
    fontSize: 11,
    headerText: "",
    footerText: "Page {page}",
    fontFamily: "default",
  },
  updateSettings: (partial) => set((s) => ({ settings: { ...s.settings, ...partial } })),

  status: "idle",
  setStatus: (status) => set({ status }),

  errorMessage: null,
  setError: (message) => set({ errorMessage: message }),
}));
