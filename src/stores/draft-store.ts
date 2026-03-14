import { create } from "zustand";
import { createStore, get, set, del, entries } from "idb-keyval";
import type { Draft, DraftMeta } from "@/types/draft";

const draftDb = createStore("wasmark-drafts", "drafts");

interface DraftStore {
  drafts: DraftMeta[];
  loading: boolean;

  loadDraftList: () => Promise<void>;
  loadDraft: (id: string) => Promise<Draft | undefined>;
  saveDraft: (draft: Pick<Draft, "id" | "title" | "content">) => Promise<void>;
  createDraft: (title: string, content: string) => Promise<string>;
  deleteDraft: (id: string) => Promise<void>;
  renameDraft: (id: string, title: string) => Promise<void>;
}

export const useDraftStore = create<DraftStore>()((setState, getState) => ({
  drafts: [],
  loading: true,

  loadDraftList: async () => {
    setState({ loading: true });
    const allEntries = await entries<string, Draft>(draftDb);
    const metas: DraftMeta[] = allEntries
      .map(([, draft]) => ({
        id: draft.id,
        title: draft.title,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    setState({ drafts: metas, loading: false });
  },

  loadDraft: async (id) => {
    return get<Draft>(id, draftDb);
  },

  saveDraft: async (partial) => {
    const existing = await get<Draft>(partial.id, draftDb);
    const draft: Draft = existing
      ? { ...existing, ...partial, updatedAt: Date.now() }
      : { ...partial, createdAt: Date.now(), updatedAt: Date.now() };
    await set(draft.id, draft, draftDb);

    // Update metas list
    const { drafts } = getState();
    const idx = drafts.findIndex((d) => d.id === draft.id);
    const meta: DraftMeta = {
      id: draft.id,
      title: draft.title,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
    if (idx >= 0) {
      const updated = [...drafts];
      updated[idx] = meta;
      setState({ drafts: updated.sort((a, b) => b.updatedAt - a.updatedAt) });
    } else {
      setState({ drafts: [meta, ...drafts] });
    }
  },

  createDraft: async (title, content) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const draft: Draft = { id, title, content, createdAt: now, updatedAt: now };
    await set(id, draft, draftDb);
    setState((s) => ({
      drafts: [
        { id, title, createdAt: now, updatedAt: now },
        ...s.drafts,
      ],
    }));
    return id;
  },

  deleteDraft: async (id) => {
    await del(id, draftDb);
    setState((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) }));
  },

  renameDraft: async (id, title) => {
    const draft = await get<Draft>(id, draftDb);
    if (!draft) return;
    draft.title = title;
    draft.updatedAt = Date.now();
    await set(id, draft, draftDb);
    setState((s) => ({
      drafts: s.drafts.map((d) => (d.id === id ? { ...d, title, updatedAt: draft.updatedAt } : d)),
    }));
  },
}));
