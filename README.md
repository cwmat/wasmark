# WASMark

A fully client-side Markdown editor with live HTML preview and WASM-powered PDF export via [Typst](https://typst.app). No server, no backend — everything runs in your browser.

**[Try it live](https://cwmat.github.io/wasmark/)**

## Features

- **Live Preview** — Side-by-side editor and rendered HTML preview with 150ms debounced rendering
- **PDF Export** — Generate polished PDFs with configurable page size, margins, fonts, headers, and footers powered by the Typst WASM compiler
- **Draft Management** — Save, load, rename, and delete drafts stored locally in IndexedDB
- **Autosave** — Drafts automatically save after 2 seconds of inactivity
- **File Import** — Drag and drop `.md` files directly into the editor
- **Syntax Highlighting** — CodeMirror 6 editor with full Markdown syntax highlighting and GFM support
- **Fully Private** — All processing happens locally in your browser. Your data never leaves your machine.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build | Vite 6 |
| Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Markdown Rendering | markdown-it |
| PDF Engine | Typst WASM (`@myriaddreamin/typst.ts`) |
| State Management | Zustand |
| Storage | IndexedDB via idb-keyval |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Enable PDF Export

The Typst WASM compiler is included as a dependency. On first PDF export, the compiler and font assets are lazy-loaded (~15-20MB one-time download, cached by the browser afterward).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run tests with Vitest |

## Architecture

```
User types in CodeMirror
  -> editor-store.setContent()
  -> useMarkdownPreview hook debounces (150ms)
  -> markdown-it renders HTML
  -> MarkdownPreview displays result

Autosave watches editor-store.isDirty
  -> debounces 2s
  -> writes to IndexedDB via draft-store

Export PDF reads markdown from editor-store
  -> markdownToTypst() converts to Typst markup
  -> posts to Web Worker
  -> worker loads Typst WASM compiler
  -> compiles PDF -> triggers download
```

## Deployment

The app is deployed to GitHub Pages via a GitHub Actions workflow. Pushes to `main` trigger an automatic build and deploy to [https://cwmat.github.io/wasmark/](https://cwmat.github.io/wasmark/).

## License

[MIT](LICENSE)
