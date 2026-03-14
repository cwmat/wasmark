import { FileText, FolderOpen, Download, Settings, Eye, SplitSquareHorizontal, Pencil } from "lucide-react";
import { useUiStore, type ViewMode } from "@/stores/ui-store";
import { useExportStore } from "@/stores/export-store";
import { usePdfExport } from "@/hooks/usePdfExport";
import { DraftList } from "@/components/drafts/DraftList";

const VIEW_MODES: { mode: ViewMode; icon: typeof Eye; label: string }[] = [
  { mode: "editor", icon: Pencil, label: "Editor" },
  { mode: "split", icon: SplitSquareHorizontal, label: "Split" },
  { mode: "preview", icon: Eye, label: "Preview" },
];

export function Header() {
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const draftsOpen = useUiStore((s) => s.draftsOpen);
  const toggleDrafts = useUiStore((s) => s.toggleDrafts);
  const toggleExportSettings = useUiStore((s) => s.toggleExportSettings);
  const exportStatus = useExportStore((s) => s.status);
  const { exportPdf } = usePdfExport();

  const isExporting = exportStatus === "initializing" || exportStatus === "compiling";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          <h1 className="text-sm font-semibold tracking-tight text-text-primary">WASMark</h1>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded bg-surface-2">
          {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              className={`flex items-center gap-1 px-2 py-1 text-xs transition-colors ${
                viewMode === mode
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={toggleDrafts}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Drafts
          </button>
          {draftsOpen && <DraftList />}
        </div>

        <button
          onClick={toggleExportSettings}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">PDF Settings</span>
        </button>

        <button
          onClick={() => void exportPdf()}
          disabled={isExporting}
          className="flex items-center gap-1.5 rounded bg-accent/15 px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </>
          )}
        </button>
      </div>
    </header>
  );
}
