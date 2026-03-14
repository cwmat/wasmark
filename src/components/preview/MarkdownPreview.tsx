import { useEditorStore } from "@/stores/editor-store";
import { useMarkdownPreview } from "@/hooks/useMarkdownPreview";

export function MarkdownPreview() {
  const content = useEditorStore((s) => s.content);
  const html = useMarkdownPreview(content);

  return (
    <div className="h-full overflow-auto bg-surface-0 p-6">
      <div
        className="preview-content mx-auto max-w-3xl text-sm text-text-primary"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
