import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

const client = new ChromaClient({ host: process.env.CHROMA_HOST });
const embedder = new DefaultEmbeddingFunction();

export const collection = await client.getOrCreateCollection({
  name: "obsidian_vault",
  embeddingFunction: embedder,
});
