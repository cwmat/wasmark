import { useCallback, useRef, type ReactNode } from "react";
import { useUiStore } from "@/stores/ui-store";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

export function SplitPane({ left, right }: SplitPaneProps) {
  const splitRatio = useUiStore((s) => s.splitRatio);
  const setSplitRatio = useUiStore((s) => s.setSplitRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const ratio = Math.max(0.2, Math.min(0.8, (ev.clientX - rect.left) / rect.width));
        setSplitRatio(ratio);
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [setSplitRatio],
  );

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${splitRatio * 100}%` }} className="min-w-0">
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        className="flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-accent/40"
      >
        <div className="h-8 w-0.5 rounded-full bg-text-muted/30" />
      </div>
      <div style={{ width: `${(1 - splitRatio) * 100}%` }} className="min-w-0">
        {right}
      </div>
    </div>
  );
}
