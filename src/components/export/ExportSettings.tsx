import { X } from "lucide-react";
import { useExportStore } from "@/stores/export-store";
import { useUiStore } from "@/stores/ui-store";
import type { ExportSettings as ExportSettingsType } from "@/types/export";

const PAGE_SIZES: { value: ExportSettingsType["pageSize"]; label: string }[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "US Letter" },
  { value: "legal", label: "US Legal" },
];

const FONT_FAMILIES: { value: ExportSettingsType["fontFamily"]; label: string }[] = [
  { value: "default", label: "Default (Computer Modern)" },
  { value: "serif", label: "Serif (Libertine)" },
  { value: "sans-serif", label: "Sans-Serif" },
  { value: "monospace", label: "Monospace" },
];

export function ExportSettings() {
  const settings = useExportStore((s) => s.settings);
  const updateSettings = useExportStore((s) => s.updateSettings);
  const toggleExportSettings = useUiStore((s) => s.toggleExportSettings);

  return (
    <div className="absolute right-0 top-0 z-40 flex h-full w-72 flex-col border-l border-border bg-surface-1">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold text-text-primary">PDF Settings</h2>
        <button
          onClick={toggleExportSettings}
          className="rounded p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Page Size */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-text-secondary">Page Size</label>
          <select
            value={settings.pageSize}
            onChange={(e) =>
              updateSettings({ pageSize: e.target.value as ExportSettingsType["pageSize"] })
            }
            className="w-full rounded border border-border bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          >
            {PAGE_SIZES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Margin */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-text-secondary">
            Margin ({settings.marginMm}mm)
          </label>
          <input
            type="range"
            min={10}
            max={40}
            step={5}
            value={settings.marginMm}
            onChange={(e) => updateSettings({ marginMm: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-text-secondary">
            Font Size ({settings.fontSize}pt)
          </label>
          <input
            type="range"
            min={8}
            max={16}
            step={0.5}
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>

        {/* Font Family */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-text-secondary">Font</label>
          <select
            value={settings.fontFamily}
            onChange={(e) =>
              updateSettings({ fontFamily: e.target.value as ExportSettingsType["fontFamily"] })
            }
            className="w-full rounded border border-border bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          >
            {FONT_FAMILIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-text-secondary">Header Text</label>
          <input
            type="text"
            value={settings.headerText}
            onChange={(e) => updateSettings({ headerText: e.target.value })}
            placeholder="e.g., Document Title"
            className="w-full rounded border border-border bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
          />
        </div>

        {/* Footer Text */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-text-secondary">Footer Text</label>
          <input
            type="text"
            value={settings.footerText}
            onChange={(e) => updateSettings({ footerText: e.target.value })}
            placeholder="e.g., Page {page}"
            className="w-full rounded border border-border bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
          />
          <p className="text-[10px] text-text-muted">
            Use {"{page}"} for page number, {"{pages}"} for total
          </p>
        </div>
      </div>
    </div>
  );
}
