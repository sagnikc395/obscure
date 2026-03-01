export interface DocumentChunk {
  id: string;
  content: string;
  metadata?: Record<string, string>;
}

export interface MarkdownChunkMetadata extends Record<string, string> {
  filePath: string;
  fileName: string;
  heading: string;
  chunkIndex: string;
}

export interface QueryResult {
  ids: string[][];
  documents: (string | null)[][];
  metadatas: (Record<string, string> | null)[][];
  distances: number[][];
}
