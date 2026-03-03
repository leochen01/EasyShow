import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const links = await prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const created = await prisma.socialLink.create({
    data: {
      platform: body.platform,
      label: body.label,
      url: body.url,
      icon: body.icon,
      visible: body.visible ?? true,
      sortOrder: body.sortOrder ?? 0
    }
  });

  return NextResponse.json(created, { status: 201 });
}
