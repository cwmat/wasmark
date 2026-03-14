import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useDraftStore } from "@/stores/draft-store";

export function useAutosave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const content = useEditorStore((s) => s.content);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeDraftId = useEditorStore((s) => s.activeDraftId);
  const markClean = useEditorStore((s) => s.markClean);
  const saveDraft = useDraftStore((s) => s.saveDraft);

  useEffect(() => {
    if (!isDirty || !activeDraftId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const draft = await useDraftStore.getState().loadDraft(activeDraftId);
      if (draft) {
        await saveDraft({ id: activeDraftId, title: draft.title, content });
        markClean();
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, isDirty, activeDraftId, saveDraft, markClean]);
}
