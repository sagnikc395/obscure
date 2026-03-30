import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

const client = new ChromaClient({ host: process.env.CHROMA_HOST });
const embedder = new DefaultEmbeddingFunction();

let _collection: Awaited<ReturnType<typeof client.getOrCreateCollection>> | null = null;

export async function getCollection() {
  if (!_collection) {
    _collection = await client.getOrCreateCollection({
      name: "obsidian_vault",
      embeddingFunction: embedder,
    });
  }
  return _collection;
}
