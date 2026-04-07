import type { ExportSettings } from "@/types/export";

const PAGE_SIZES: Record<ExportSettings["pageSize"], string> = {
  a4: '"a4"',
  letter: '"us-letter"',
  legal: '"us-legal"',
};

const FONT_FAMILIES: Record<ExportSettings["fontFamily"], string> = {
  default: '"New Computer Modern"',
  serif: '"Linux Libertine"',
  "sans-serif": '"New Computer Modern Sans"',
  monospace: '"New Computer Modern Mono"',
};

export function buildTypstPreamble(settings: ExportSettings): string {
  const lines: string[] = [];

  // Page setup
  const headerPart = settings.headerText
    ? `,\n  header: align(right)[${escapeTypst(settings.headerText)}]`
    : "";

  const footerPart = settings.footerText
    ? `,\n  footer: context align(center)[${convertFooterTemplate(settings.footerText)}]`
    : "";

  lines.push(
    `#set page(paper: ${PAGE_SIZES[settings.pageSize]}, margin: ${settings.marginMm}mm${headerPart}${footerPart})`,
  );

  // Font
  lines.push(
    `#set text(font: ${FONT_FAMILIES[settings.fontFamily]}, size: ${settings.fontSize}pt)`,
  );

  // Heading style
  lines.push(`#set heading(numbering: none)`);

  // Paragraph spacing
  lines.push(`#set par(justify: true)`);

  // Style links as blue underlined text
  lines.push(`#show link: it => underline(text(fill: rgb("#4dabf7"), it))`);

  return lines.join("\n") + "\n\n";
}

function escapeTypst(text: string): string {
  return text.replace(/[#\[\]]/g, (ch) => `\\${ch}`);
}

function convertFooterTemplate(template: string): string {
  return template
    .replace(/\{page\}/g, "#counter(page).display()")
    .replace(/\{pages\}/g, '#context counter(page).final().at(0)');
}
