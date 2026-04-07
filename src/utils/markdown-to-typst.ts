import type { ExportSettings } from "@/types/export";
import { buildTypstPreamble } from "./typst-preamble";

export function markdownToTypst(markdown: string, settings: ExportSettings): string {
  const preamble = buildTypstPreamble(settings);
  const body = basicMarkdownToTypst(markdown);
  return preamble + body;
}

/**
 * Basic markdown-to-typst converter.
 * Handles the most common markdown constructs.
 */
function basicMarkdownToTypst(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let tableRows: string[][] = [];

  for (const line of lines) {
    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        result.push("```");
        inCodeBlock = false;
        codeBlockLang = "";
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        result.push(codeBlockLang ? `\`\`\`${codeBlockLang}` : "```");
      }
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Table rows — collect and flush when table ends
    const tableMatch = line.match(/^\|(.+)\|$/);
    if (tableMatch) {
      const cells = tableMatch[1]!.split("|").map((c) => c.trim());
      // Skip separator rows like |---|---|
      if (!cells.every((c) => /^[-:]+$/.test(c))) {
        tableRows.push(cells);
      }
      continue;
    } else if (tableRows.length > 0) {
      result.push(flushTable(tableRows));
      tableRows = [];
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const text = convertInline(headingMatch[2]!);
      result.push(`${"=".repeat(level)} ${text}`);
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      result.push("#line(length: 100%)");
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      result.push(`#quote[${convertInline(line.slice(2))}]`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (ulMatch) {
      const indent = Math.floor((ulMatch[1]?.length ?? 0) / 2);
      const text = convertInline(ulMatch[2]!);
      result.push(`${"  ".repeat(indent)}- ${text}`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      const indent = Math.floor((olMatch[1]?.length ?? 0) / 2);
      const text = convertInline(olMatch[2]!);
      result.push(`${"  ".repeat(indent)}+ ${text}`);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      result.push("");
      continue;
    }

    // Regular paragraph
    result.push(convertInline(line));
  }

  // Flush any trailing table
  if (tableRows.length > 0) {
    result.push(flushTable(tableRows));
  }

  return result.join("\n");
}

/** Escape characters that have special meaning in Typst */
function escapeTypstText(text: string): string {
  return text.replace(/[#@$\\<>\[\]{}]/g, (ch) => `\\${ch}`);
}

function convertInline(text: string): string {
  // Process inline code first to protect its contents
  const codeSegments: string[] = [];
  const withCodePlaceholders = text.replace(/`([^`]+)`/g, (_, code) => {
    codeSegments.push(`\`${code}\``);
    return `\x00CODE${codeSegments.length - 1}\x00`;
  });

  let result = withCodePlaceholders
    // Images (before links since they share similar syntax)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, _alt, url) => `#image("${url}")`)
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, label, url) => `#link("${url}")[${escapeTypstText(label)}]`,
    )
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    // Italic (must come after bold)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "_$1_")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "#strike[$1]");

  // Escape special Typst characters in remaining plain text
  // Split on Typst function calls (#func[...]) and markup (*bold*, _italic_) to avoid escaping those
  result = result.replace(
    /(#\w+(?:\([^)]*\))?(?:\[[^\]]*\])?|\*[^*]+\*|_[^_]+_|`[^`]+`|\x00CODE\d+\x00)/g,
    (match) => `\x00KEEP${match}\x00KEEP`,
  );
  const parts = result.split("\x00KEEP");
  result = parts.map((part) => (part.startsWith("") ? part : escapeTypstText(part))).join("");

  // Restore code segments
  result = result.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeSegments[parseInt(i)]!);

  return result;
}

function flushTable(rows: string[][]): string {
  if (rows.length === 0) return "";
  const cols = rows[0]!.length;
  const lines: string[] = [];
  lines.push(`#table(`);
  lines.push(`  columns: ${cols},`);
  for (const row of rows) {
    for (const cell of row) {
      lines.push(`  [${convertInline(cell)}],`);
    }
  }
  lines.push(`)`);
  return lines.join("\n");
}
