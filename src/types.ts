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

export interface GraphNode {
  id: string;
  label: string;
  filePath: string;
  tags: string[];
  linkCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "wikilink" | "tag";
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SyncManifest {
  files: Record<string, { mtime: number; hash: string }>;
  lastSync: string;
}
