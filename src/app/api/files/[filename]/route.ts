import path from "node:path";
import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const filename = (params.filename || "").trim();
  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ message: "invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  try {
    const data = await readFile(filePath);
    const contentType = contentTypeByExt(path.extname(filename).toLowerCase());
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
}

function contentTypeByExt(ext: string) {
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".ico") return "image/x-icon";
  return "application/octet-stream";
}
