import { useEditorStore } from "@/stores/editor-store";
import { useExportStore } from "@/stores/export-store";

export function Footer() {
  const content = useEditorStore((s) => s.content);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeDraftId = useEditorStore((s) => s.activeDraftId);
  const exportStatus = useExportStore((s) => s.status);
  const errorMessage = useExportStore((s) => s.errorMessage);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-surface-1 px-4 text-[11px] text-text-muted">
      <div className="flex items-center gap-3">
        <span>
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <span className="text-text-muted/50">|</span>
        <span>
          {charCount.toLocaleString()} char{charCount !== 1 ? "s" : ""}
        </span>
        {activeDraftId && isDirty && (
          <>
            <span className="text-text-muted/50">|</span>
            <span className="text-status-processing">Unsaved</span>
          </>
        )}
        {activeDraftId && !isDirty && (
          <>
            <span className="text-text-muted/50">|</span>
            <span className="text-status-complete">Saved</span>
          </>
        )}
        {exportStatus === "compiling" && (
          <>
            <span className="text-text-muted/50">|</span>
            <span className="text-status-processing">Compiling PDF...</span>
          </>
        )}
        {exportStatus === "initializing" && (
          <>
            <span className="text-text-muted/50">|</span>
            <span className="text-status-processing">Loading PDF engine...</span>
          </>
        )}
        {exportStatus === "complete" && (
          <>
            <span className="text-text-muted/50">|</span>
            <span className="text-status-complete">PDF exported</span>
          </>
        )}
        {exportStatus === "error" && errorMessage && (
          <>
            <span className="text-text-muted/50">|</span>
            <span className="text-status-error" title={errorMessage}>
              Export failed: {errorMessage}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span>Client-side only</span>
        <span className="text-text-muted/50">|</span>
        <span>Your data stays local</span>
      </div>
    </footer>
  );
}
