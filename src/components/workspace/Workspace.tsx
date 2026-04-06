import { useEffect, useState, useCallback, useRef, type DragEvent } from "react";
import { useUiStore } from "@/stores/ui-store";
import { useEditorStore } from "@/stores/editor-store";
import { useDraftStore } from "@/stores/draft-store";
import { useAutosave } from "@/hooks/useAutosave";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { ExportSettings } from "@/components/export/ExportSettings";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { SplitPane } from "./SplitPane";

export function Workspace() {
  const viewMode = useUiStore((s) => s.viewMode);
  const exportSettingsOpen = useUiStore((s) => s.exportSettingsOpen);

  const [dragging, setDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; content: string } | null>(null);
  const dragCounter = useRef(0);

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

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".md")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPendingFile({ name: file.name, content: reader.result });
      }
    };
    reader.readAsText(file);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingFile) {
      useEditorStore.getState().setContent(pendingFile.content);
    }
    setPendingFile(null);
  }, [pendingFile]);

  const handleCancel = useCallback(() => {
    setPendingFile(null);
  }, []);

  return (
    <div
      className="relative flex h-full w-full"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex-1">
        {viewMode === "split" && (
          <SplitPane left={<MarkdownEditor />} right={<MarkdownPreview />} />
        )}
        {viewMode === "editor" && <MarkdownEditor />}
        {viewMode === "preview" && <MarkdownPreview />}
      </div>

      {exportSettingsOpen && <ExportSettings />}

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded border-2 border-dashed border-accent bg-accent/5">
          <span className="text-sm font-medium text-accent">Drop .md file here</span>
        </div>
      )}

      <ConfirmModal
        open={pendingFile !== null}
        title="Import Markdown File"
        message={`Loading "${pendingFile?.name ?? ""}" will overwrite the current editor content. This cannot be undone.`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
