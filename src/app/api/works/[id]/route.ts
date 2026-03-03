import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = await request.json();

  const updated = await prisma.work.update({
    where: { id: params.id },
    data: {
      type: body.type,
      titleZh: body.titleZh,
      titleEn: body.titleEn,
      descriptionZh: body.descriptionZh,
      descriptionEn: body.descriptionEn,
      contentZh: body.contentZh ?? null,
      contentEn: body.contentEn ?? null,
      tags: body.tags,
      category: body.category,
      slug: body.slug,
      slugZh: body.slugZh,
      slugEn: body.slugEn,
      coverImage: body.coverImage,
      demoLink: body.demoLink,
      publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
      visible: body.visible,
      featured: body.featured
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  await prisma.work.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
