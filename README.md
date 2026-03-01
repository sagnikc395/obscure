# obscure

an simple CLI to interact with Obsidian
on the command line to make it easier to interact with it and also to
make it easier to export a directed knowledge graph.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## New files

src/types.ts — shared DocumentChunk, MarkdownChunkMetadata, QueryResult interfaces
src/command/ingest.ts — obscure ingest `<directory>` command
src/command/query.ts — obscure query `<text>` command

## Updated files

src/utils.ts — walkMarkdownFiles, chunkMarkdown (with frontmatter stripping, heading-based splitting, hidden dir filtering)
src/db/client.ts — getOrCreateCollection with DefaultEmbeddingFunction; safe to run multiple times
src/db/addData.ts — addDocuments using upsert (idempotent re-runs)
src/index.ts — registers all three commands
Usage (requires ChromaDB running locally on port 8000):

## Commands

### Ingest a vault

bun run src/index.ts ingest ~/my-obsidian-vault -v

### Query it

bun run src/index.ts query "how do transformers work" -n 3
