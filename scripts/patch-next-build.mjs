import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.join(process.cwd(), ".next", "required-server-files.json");

try {
  const source = await readFile(filePath, "utf8");
  JSON.parse(source);
  console.log("[next-patch] required-server-files.json is valid");
} catch {
  const source = await readFile(filePath, "utf8");
  const fixed = sanitizeJsonObject(source);
  JSON.parse(fixed);
  await writeFile(filePath, fixed, "utf8");
  console.log("[next-patch] repaired required-server-files.json trailing corruption");
}

function sanitizeJsonObject(source) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(0, i + 1);
      }
    }
  }

  throw new Error("Unable to recover required-server-files.json");
}
