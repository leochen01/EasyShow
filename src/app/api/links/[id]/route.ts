import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = await request.json();

  const updated = await prisma.socialLink.update({
    where: { id: params.id },
    data: {
      platform: body.platform,
      label: body.label,
      url: body.url,
      visible: body.visible,
      sortOrder: body.sortOrder,
      icon: body.icon
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  await prisma.socialLink.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
