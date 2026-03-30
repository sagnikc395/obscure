import { getCollection } from "./client";
import type { DocumentChunk } from "../types";

export async function addDocuments(chunks: DocumentChunk[]): Promise<void> {
  if (chunks.length === 0) return;
  const collection = await getCollection();
  await collection.upsert({
    ids: chunks.map((c) => c.id),
    documents: chunks.map((c) => c.content),
    metadatas: chunks.map((c) => c.metadata ?? {}),
  });
}
