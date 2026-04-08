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
function escapeTypst(text: string): string {
  return text.replace(/[#@$\\<>\[\]{}]/g, (ch) => `\\${ch}`);
}

/**
 * Convert markdown inline formatting to Typst.
 * Uses a regex tokenizer to split into: code spans, images, links, bold,
 * italic, strikethrough, and plain text. Only plain text gets escaped.
 */
function convertInline(text: string): string {
  // Regex that matches markdown inline constructs in priority order
  const tokenPattern =
    /`([^`]+)`|!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|~~(.+?)~~/g;

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    // Escape plain text before this match
    if (match.index > lastIndex) {
      result += escapeTypst(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // Inline code: `code`
      result += `\`${match[1]}\``;
    } else if (match[3] !== undefined) {
      // Image: ![alt](url)
      result += `#image("${match[3]}")`;
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // Link: [label](url)
      result += `#link("${match[5]}")[${escapeTypst(match[4])}]`;
    } else if (match[6] !== undefined) {
      // Bold: **text**
      result += `*${convertInline(match[6])}*`;
    } else if (match[7] !== undefined) {
      // Italic: *text*
      result += `_${convertInline(match[7])}_`;
    } else if (match[8] !== undefined) {
      // Strikethrough: ~~text~~
      result += `#strike[${convertInline(match[8])}]`;
    }

    lastIndex = match.index + match[0].length;
  }

  // Escape remaining plain text after last match
  if (lastIndex < text.length) {
    result += escapeTypst(text.slice(lastIndex));
  }

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
