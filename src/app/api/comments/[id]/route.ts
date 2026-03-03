import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const updated = await prisma.comment.update({
    where: { id: params.id },
    data: {
      status: body.status,
      content: body.content
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
