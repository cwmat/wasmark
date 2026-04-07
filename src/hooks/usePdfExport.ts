import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useExportStore } from "@/stores/export-store";
import type { TypstWorkerInbound, TypstWorkerOutbound } from "@/types/worker-messages";
import { markdownToTypst } from "@/utils/markdown-to-typst";

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("@/workers/typst-compiler.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

export function usePdfExport() {
  const status = useExportStore((s) => s.status);
  const setStatus = useExportStore((s) => s.setStatus);
  const setError = useExportStore((s) => s.setError);
  const settings = useExportStore((s) => s.settings);
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const w = getWorker();
    const handler = (e: MessageEvent<TypstWorkerOutbound>) => {
      const msg = e.data;
      switch (msg.type) {
        case "INIT_COMPLETE":
          break;
        case "COMPILE_PROGRESS":
          setStatus("compiling");
          break;
        case "COMPILE_COMPLETE": {
          const blob = new Blob([msg.payload.pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "document.pdf";
          a.click();
          URL.revokeObjectURL(url);
          setStatus("complete");
          setTimeout(() => setStatus("idle"), 2000);
          resolveRef.current?.();
          break;
        }
        case "COMPILE_ERROR":
          console.error("[PDF Export]", msg.payload.message);
          setError(msg.payload.message);
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
          resolveRef.current?.();
          break;
      }
    };
    const errorHandler = (e: ErrorEvent) => {
      console.error("[PDF Export] Worker error:", e.message);
      setError(e.message || "Worker crashed unexpectedly");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      resolveRef.current?.();
    };
    w.addEventListener("message", handler);
    w.addEventListener("error", errorHandler);
    return () => {
      w.removeEventListener("message", handler);
      w.removeEventListener("error", errorHandler);
    };
  }, [setStatus, setError]);

  const exportPdf = useCallback(() => {
    const content = useEditorStore.getState().content;
    const typstSource = markdownToTypst(content, settings);

    setStatus("initializing");
    setError(null);

    const w = getWorker();
    const msg: TypstWorkerInbound = {
      type: "COMPILE_PDF",
      payload: { typstSource },
    };
    w.postMessage(msg);

    return new Promise<void>((resolve) => {
      resolveRef.current = resolve;
    });
  }, [settings, setStatus, setError]);

  return { exportPdf, status };
}
