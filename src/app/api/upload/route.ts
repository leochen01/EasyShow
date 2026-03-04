import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/permissions";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon"
]);

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "file is required" }, { status: 400 });
  }

  const contentType = resolveContentType(file);
  if (!contentType || !ALLOWED.has(contentType)) {
    return NextResponse.json({ message: "unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "file too large" }, { status: 400 });
  }

  const ext = path.extname(file.name) || mimeToExt(contentType);
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const key = `uploads/${filename}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const provider = resolveProvider();
  if (provider === "s3") {
    try {
      const url = await uploadToS3(buffer, key, contentType);
      return NextResponse.json({ url, provider: "s3" });
    } catch (error) {
      console.error("S3 upload failed, fallback to local", error);
    }
  }

  const url = await uploadToLocal(buffer, filename);
  return NextResponse.json({ url, provider: "local" });
}

function resolveProvider() {
  const provider = (process.env.STORAGE_PROVIDER ?? "").toLowerCase();
  if (provider === "s3") return "s3";

  const hasS3Config =
    !!process.env.S3_BUCKET &&
    !!process.env.S3_REGION &&
    !!process.env.S3_ACCESS_KEY_ID &&
    !!process.env.S3_SECRET_ACCESS_KEY;

  return hasS3Config ? "s3" : "local";
}

async function uploadToLocal(buffer: Buffer, filename: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/api/files/${filename}`;
}

async function uploadToS3(buffer: Buffer, key: string, contentType: string) {
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing S3 configuration");
  }

  const endpoint = process.env.S3_ENDPOINT;
  const client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000"
    })
  );

  const base = process.env.S3_PUBLIC_BASE_URL;
  if (base) {
    return `${base.replace(/\/$/, "")}/${key}`;
  }

  if (endpoint) {
    return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function mimeToExt(mime: string) {
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/svg+xml") return ".svg";
  if (mime === "image/x-icon" || mime === "image/vnd.microsoft.icon") return ".ico";
  return "";
}

function resolveContentType(file: File) {
  if (ALLOWED.has(file.type)) return file.type;
  const ext = path.extname(file.name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".ico") return "image/x-icon";
  return "";
}
