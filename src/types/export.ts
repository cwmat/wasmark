export interface ExportSettings {
  pageSize: "a4" | "letter" | "legal";
  marginMm: number;
  fontSize: number;
  headerText: string;
  footerText: string;
  fontFamily: "default" | "serif" | "sans-serif" | "monospace";
}

export type ExportStatus = "idle" | "initializing" | "compiling" | "complete" | "error";
