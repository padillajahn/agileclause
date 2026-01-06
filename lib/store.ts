// lib/store.ts
// In-memory store shared across routes and hot reloads

export type StoredDoc = {
  id: string;
  filename: string;
  text: string;
  uploadedAt: number;
};

// Use a global singleton so Next.js dev server & HMR don't create new Maps
declare global {
  // eslint-disable-next-line no-var
  var __agileClauseStore: Map<string, StoredDoc> | undefined;
}

const _docs: Map<string, StoredDoc> =
  globalThis.__agileClauseStore || new Map<string, StoredDoc>();

if (!globalThis.__agileClauseStore) {
  globalThis.__agileClauseStore = _docs;
}

export function saveDoc(doc: StoredDoc) {
  _docs.set(doc.id, doc);
}

export function getDoc(id: string) {
  return _docs.get(id) || null;
}
