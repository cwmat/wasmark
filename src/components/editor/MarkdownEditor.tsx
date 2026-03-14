import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { wasmarkTheme } from "@/constants/editor-theme";
import { useEditorStore } from "@/stores/editor-store";
import { useCallback } from "react";
import { EditorToolbar } from "./EditorToolbar";

const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
];

export function MarkdownEditor() {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);

  const onChange = useCallback(
    (value: string) => {
      setContent(value);
    },
    [setContent],
  );

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar />
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror
          value={content}
          onChange={onChange}
          theme={wasmarkTheme}
          extensions={extensions}
          height="100%"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            indentOnInput: true,
          }}
          className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:h-full"
        />
      </div>
    </div>
  );
}
