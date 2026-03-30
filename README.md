# obscure

<img src="./public/obscura.jpg" height="200" width="200" />

obscure is an simple CLI to interact with Obsidian that ingests your Markdown documents into a embedding database
and provides insights on your data and helps builds an knowledge graph from it.

## Setup

### Prerequisites

- [Bun](https://bun.sh) (v1.3.9+)
- [Docker](https://docs.docker.com/get-docker/)

### 1. Install dependencies

```bash
bun install
```

### 2. Start ChromaDB

```bash
docker compose up -d
```

This starts a ChromaDB instance on port 8000 with persistent storage.

### 3. Configure environment

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

Default `.env`:

```
CHROMA_HOST=http://localhost:8000
```

### 4. Run

```bash
bun run src/index.ts
```

## Files

- src/types.ts — shared DocumentChunk, MarkdownChunkMetadata, QueryResult interfaces
- src/command/ingest.ts — obscure ingest `<directory>` command
- src/command/query.ts — obscure query `<text>` command
- src/utils.ts — walkMarkdownFiles, chunkMarkdown (with frontmatter stripping, heading-based splitting, hidden dir filtering)
- src/db/client.ts — getOrCreateCollection with DefaultEmbeddingFunction; safe to run multiple times
- src/db/addData.ts — addDocuments using upsert (idempotent re-runs)
- src/index.ts — registers all three commands

## Commands

### Ingest a vault

bun run src/index.ts ingest ~/my-obsidian-vault -v

### Query it

bun run src/index.ts query "how do transformers work" -n 3
