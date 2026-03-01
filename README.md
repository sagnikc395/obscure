# obscure

<img src="./public/obscura.jpg" height="200" width="200" />

(read as obs-cure)
obscure is an simple CLI to interact with Obsidian that ingests your Markdown documents into a embedding database
and provides insights on your data and helps builds an knowledge graph from it.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

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
