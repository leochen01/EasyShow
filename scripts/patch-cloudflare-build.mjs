import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), ".open-next", "server-functions");
const replacements = [
  {
    from: 'process.chdir("")',
    to: 'process.chdir(require("node:url").fileURLToPath(new URL(".", import.meta.url)))'
  },
  {
    from: 'process.chdir(".")',
    to: 'process.chdir(require("node:url").fileURLToPath(new URL(".", import.meta.url)))'
  }
];

let patched = 0;

await walk(root);

if (patched === 0) {
  console.log("[cf-patch] no generated handler needed patching");
} else {
  console.log(`[cf-patch] patched ${patched} generated handler file(s)`);
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !fullPath.endsWith(".mjs")) continue;
    await patchFile(fullPath);
  }
}

async function patchFile(filePath) {
  const fileInfo = await stat(filePath);
  if (fileInfo.size === 0) return;

  const source = await readFile(filePath, "utf8");
  let next = source;
  let changed = false;

  for (const replacement of replacements) {
    if (!next.includes(replacement.from)) continue;
    next = next.split(replacement.from).join(replacement.to);
    changed = true;
  }

  if (!changed) return;

  await writeFile(filePath, next, "utf8");
  patched += 1;
}
