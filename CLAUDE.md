# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server on port 5173
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run format       # Prettier (src/**/*.{ts,tsx,css})
npm run test         # Vitest
```

## Architecture

WASMark is a fully client-side Markdown editor with live HTML preview and PDF export via Typst WASM. No server, no backend — everything runs in the browser.

### Data Flow

**Editing:** User types in CodeMirror → `editor-store.setContent()` → `useMarkdownPreview` hook debounces (150ms) and renders via markdown-it → `MarkdownPreview` displays HTML.

**Autosave:** `useAutosave` hook watches `editor-store.isDirty`, debounces 2s, writes to IndexedDB via `draft-store.saveDraft()`.

**PDF Export:** `usePdfExport` reads markdown from editor-store → `markdownToTypst()` converts to Typst markup with preamble → posts to `typst-compiler.worker.ts` Web Worker → worker lazy-loads typst.ts WASM compiler via `runtimeImport()` (bypasses Vite bundling) → compiles PDF → posts ArrayBuffer back → triggers blob download.

### Key Patterns

- **Path alias:** `@/` maps to `src/` (configured in vite.config.ts and tsconfig.app.json)
- **Stores:** Zustand without persist middleware. Four stores: `editor-store` (content, dirty state, active draft ID), `ui-store` (split ratio, view mode), `export-store` (PDF settings, export status), `draft-store` (IndexedDB CRUD via idb-keyval)
- **WASM in workers:** The typst WASM compiler loads inside a Web Worker to avoid blocking the main thread. Uses `runtimeImport()` (a `new Function` wrapper) to prevent Vite/Rollup from resolving the import at build time — `@myriaddreamin/typst.ts` is an optional dependency
- **Worker messages:** Typed discriminated unions in `src/types/worker-messages.ts` (pattern: `TypstWorkerInbound` / `TypstWorkerOutbound`)
- **COOP/COEP headers:** Required for SharedArrayBuffer. Dev server sets them in vite.config.ts; production uses `coi-serviceworker.js` in `public/`
- **Theme:** Deep Space (#12) dark palette — CSS custom properties defined in `src/index.css` under `@theme {}` (Tailwind CSS 4 syntax)

### Sibling Project Conventions

This project follows conventions established by other apps in the `wasm-apps/` directory (pixel-forge, json-surgeon, geo-forge, frame-ripper): same vite.config.ts structure, eslint/prettier config, store patterns, layout component hierarchy (MainLayout → Header/Footer), and worker message typing.

## PDF Export (Optional Dependency)

The typst.ts WASM compiler is not bundled by default. To enable PDF export:

```bash
npm i @myriaddreamin/typst.ts
```

Without it, the app works fully for editing/preview/drafts — PDF export will show an error message directing the user to install the package.
