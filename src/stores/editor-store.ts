import { create } from "zustand";
import { DEFAULT_CONTENT } from "@/constants/defaults";

interface EditorStore {
  content: string;
  setContent: (content: string) => void;

  isDirty: boolean;
  markDirty: () => void;
  markClean: () => void;

  activeDraftId: string | null;
  setActiveDraftId: (id: string | null) => void;
}

export const useEditorStore = create<EditorStore>()((set) => ({
  content: DEFAULT_CONTENT,
  setContent: (content) => set({ content, isDirty: true }),

  isDirty: false,
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  activeDraftId: null,
  setActiveDraftId: (id) => set({ activeDraftId: id }),
}));
