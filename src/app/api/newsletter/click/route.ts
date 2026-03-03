import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get("log");
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ message: "Missing target url" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ message: "Invalid target url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return NextResponse.json({ message: "Unsupported protocol" }, { status: 400 });
  }

  if (logId) {
    await prisma.emailLog.updateMany({
      where: { id: logId, clickedAt: null },
      data: { clickedAt: new Date() }
    });
  }

  return NextResponse.redirect(targetUrl, { status: 302 });
}
