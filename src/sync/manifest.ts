import { join } from "node:path";
import type { SyncManifest } from "../types";

const MANIFEST_FILE = ".obscure-sync.json";

export function manifestPath(vaultDir: string): string {
  return join(vaultDir, MANIFEST_FILE);
}

export async function loadManifest(vaultDir: string): Promise<SyncManifest> {
  const path = manifestPath(vaultDir);
  const file = Bun.file(path);
  if (await file.exists()) {
    return (await file.json()) as SyncManifest;
  }
  return { files: {}, lastSync: "" };
}

export async function saveManifest(
  vaultDir: string,
  manifest: SyncManifest,
): Promise<void> {
  manifest.lastSync = new Date().toISOString();
  await Bun.write(manifestPath(vaultDir), JSON.stringify(manifest, null, 2));
}
