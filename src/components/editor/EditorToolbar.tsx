import { Bold, Italic, Heading1, Heading2, Link, Image, Code, Table2, Minus } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  insert: string;
  wrap?: [string, string];
}

const ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", insert: "**bold**", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", insert: "*italic*", wrap: ["*", "*"] },
  { icon: Heading1, label: "Heading 1", insert: "# " },
  { icon: Heading2, label: "Heading 2", insert: "## " },
  { icon: Link, label: "Link", insert: "[text](url)" },
  { icon: Image, label: "Image", insert: "![alt](url)" },
  { icon: Code, label: "Code", insert: "`code`", wrap: ["`", "`"] },
  {
    icon: Table2,
    label: "Table",
    insert: "\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n",
  },
  { icon: Minus, label: "Horizontal Rule", insert: "\n---\n" },
];

function handleAction(action: ToolbarAction) {
  const content = useEditorStore.getState().content;
  const setContent = useEditorStore.getState().setContent;
  // Simple insert at end approach - the CodeMirror editor will sync via the store
  setContent(content + action.insert);
}

export function EditorToolbar() {
  return (
    <div className="flex items-center gap-0.5 border-b border-border bg-surface-1/50 px-2 py-1">
      {ACTIONS.map(({ icon: Icon, label, ...rest }) => (
        <button
          key={label}
          onClick={() => handleAction({ icon: Icon, label, ...rest })}
          title={label}
          className="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-secondary"
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
