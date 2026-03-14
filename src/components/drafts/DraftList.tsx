import { Plus, Trash2, FileText } from "lucide-react";
import { useDraftStore } from "@/stores/draft-store";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { DEFAULT_CONTENT } from "@/constants/defaults";

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DraftList() {
  const drafts = useDraftStore((s) => s.drafts);
  const createDraft = useDraftStore((s) => s.createDraft);
  const deleteDraft = useDraftStore((s) => s.deleteDraft);
  const loadDraft = useDraftStore((s) => s.loadDraft);
  const activeDraftId = useEditorStore((s) => s.activeDraftId);
  const setContent = useEditorStore((s) => s.setContent);
  const setActiveDraftId = useEditorStore((s) => s.setActiveDraftId);
  const markClean = useEditorStore((s) => s.markClean);
  const toggleDrafts = useUiStore((s) => s.toggleDrafts);

  const handleSelect = async (id: string) => {
    const draft = await loadDraft(id);
    if (draft) {
      setContent(draft.content);
      setActiveDraftId(draft.id);
      markClean();
    }
    toggleDrafts();
  };

  const handleCreate = async () => {
    const id = await createDraft("Untitled", DEFAULT_CONTENT);
    setContent(DEFAULT_CONTENT);
    setActiveDraftId(id);
    markClean();
    toggleDrafts();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteDraft(id);
    if (activeDraftId === id) {
      setActiveDraftId(null);
      setContent(DEFAULT_CONTENT);
      markClean();
    }
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-surface-1 shadow-xl">
      <div className="border-b border-border p-2">
        <button
          onClick={() => void handleCreate()}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          New Draft
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {drafts.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-text-muted">No saved drafts</p>
        )}
        {drafts.map((draft) => (
          <button
            key={draft.id}
            onClick={() => void handleSelect(draft.id)}
            className={`group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-2 ${
              activeDraftId === draft.id ? "bg-surface-2 text-accent" : "text-text-secondary"
            }`}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate">{draft.title}</div>
              <div className="text-[10px] text-text-muted">{timeAgo(draft.updatedAt)}</div>
            </div>
            <button
              onClick={(e) => void handleDelete(e, draft.id)}
              className="shrink-0 rounded p-0.5 text-text-muted opacity-0 transition-all hover:text-status-error group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
