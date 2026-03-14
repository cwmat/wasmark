import { Download } from "lucide-react";
import { usePdfExport } from "@/hooks/usePdfExport";

export function ExportButton() {
  const { exportPdf, status } = usePdfExport();
  const isExporting = status === "initializing" || status === "compiling";

  return (
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
  );
}
