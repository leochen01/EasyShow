import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

function maskIP(ip: string | null) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const pathname = typeof body.pathname === "string" && body.pathname.trim() ? body.pathname.trim() : "/";

  await prisma.analytics.create({
    data: {
      pathname,
      referrer: body.referrer,
      userAgent: request.headers.get("user-agent"),
      ipHash: maskIP(ip)
    }
  });

  let trackedWorkId: string | null = null;
  if (body.workId && typeof body.workId === "string") {
    trackedWorkId = body.workId;
  } else {
    const slug = parseWorkSlug(pathname);
    if (slug) {
      const work = await prisma.work.findFirst({
        where: {
          OR: [{ slug }, { slugZh: slug }, { slugEn: slug }]
        },
        select: { id: true }
      });
      trackedWorkId = work?.id ?? null;
    }
  }

  if (trackedWorkId) {
    await prisma.workView.create({ data: { workId: trackedWorkId } });
    await prisma.work.update({ where: { id: trackedWorkId }, data: { views: { increment: 1 } } });
  }

  return NextResponse.json({ ok: true });
}

function parseWorkSlug(pathname: string) {
  const cleanPath = pathname.split("?")[0] || "";
  const match = cleanPath.match(/^\/(?:en\/)?work\/([^\/?#]+)/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
