import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";
import { useEditorStore } from "@/stores/editor-store";
import { useDraftStore } from "@/stores/draft-store";
import { useAutosave } from "@/hooks/useAutosave";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { ExportSettings } from "@/components/export/ExportSettings";
import { SplitPane } from "./SplitPane";

export function Workspace() {
  const viewMode = useUiStore((s) => s.viewMode);
  const exportSettingsOpen = useUiStore((s) => s.exportSettingsOpen);

  // Initialize: load draft list and restore last draft
  useEffect(() => {
    const init = async () => {
      await useDraftStore.getState().loadDraftList();
      const drafts = useDraftStore.getState().drafts;
      if (drafts.length > 0) {
        const firstDraft = drafts[0]!;
        const draft = await useDraftStore.getState().loadDraft(firstDraft.id);
        if (draft) {
          useEditorStore.getState().setContent(draft.content);
          useEditorStore.getState().setActiveDraftId(draft.id);
          useEditorStore.getState().markClean();
        }
      }
    };
    void init();
  }, []);

  useAutosave();

  return (
    <div className="relative flex h-full w-full">
      <div className="flex-1">
        {viewMode === "split" && (
          <SplitPane left={<MarkdownEditor />} right={<MarkdownPreview />} />
        )}
        {viewMode === "editor" && <MarkdownEditor />}
        {viewMode === "preview" && <MarkdownPreview />}
      </div>

      {exportSettingsOpen && <ExportSettings />}
    </div>
  );
}
