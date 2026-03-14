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

  return result.join("\n");
}

function convertInline(text: string): string {
  return (
    text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "*$1*")
      // Italic (must come after bold)
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "_$1_")
      // Strikethrough
      .replace(/~~(.+?)~~/g, "#strike[$1]")
      // Inline code
      .replace(/`([^`]+)`/g, "`$1`")
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "#link($2)[$1]")
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '#image("$2")')
  );
}
