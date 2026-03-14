export interface Draft {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type DraftMeta = Omit<Draft, "content">;
