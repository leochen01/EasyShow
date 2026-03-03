import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const works = await prisma.work.findMany({
    where: {
      ...(type ? { type: type as "article" | "video" | "software" | "tool" } : {})
    },
    orderBy: { publishDate: "desc" }
  });
  return NextResponse.json(works);
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const created = await prisma.work.create({
    data: {
      type: body.type,
      titleZh: body.titleZh,
      titleEn: body.titleEn,
      descriptionZh: body.descriptionZh,
      descriptionEn: body.descriptionEn,
      contentZh: body.contentZh ?? null,
      contentEn: body.contentEn ?? null,
      slug: body.slug,
      slugZh: body.slugZh,
      slugEn: body.slugEn,
      coverImage: body.coverImage,
      tags: body.tags ?? "",
      category: body.category,
      demoLink: body.demoLink ?? body.links?.demo,
      sourceLink: body.links?.source,
      downloadLink: body.links?.download,
      articleLink: body.links?.article,
      publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
      visible: body.visible ?? true,
      featured: body.featured ?? false
    }
  });

  return NextResponse.json(created, { status: 201 });
}
