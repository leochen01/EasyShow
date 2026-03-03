import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const [totalVisits, todayVisits, topWorks] = await Promise.all([
    prisma.analytics.count(),
    prisma.analytics.count({ where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.work.findMany({ orderBy: { views: "desc" }, take: 5 })
  ]);

  return NextResponse.json({ totalVisits, todayVisits, topWorks });
}
