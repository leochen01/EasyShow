import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/permissions";

function normalizeWorksPageSize(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 8;
  return Math.min(24, Math.max(1, Math.trunc(parsed)));
}

function mapProfilePayload(body: Record<string, unknown>) {
  return {
    nameZh: String(body.nameZh ?? ""),
    nameEn: String(body.nameEn ?? ""),
    titleZh: body.titleZh ? String(body.titleZh) : null,
    titleEn: body.titleEn ? String(body.titleEn) : null,
    bioZh: body.bioZh ? String(body.bioZh) : null,
    bioEn: body.bioEn ? String(body.bioEn) : null,
    landingKickerZh: body.landingKickerZh ? String(body.landingKickerZh) : null,
    landingKickerEn: body.landingKickerEn ? String(body.landingKickerEn) : null,
    landingHeadlineZh: body.landingHeadlineZh ? String(body.landingHeadlineZh) : null,
    landingHeadlineEn: body.landingHeadlineEn ? String(body.landingHeadlineEn) : null,
    landingSublineZh: body.landingSublineZh ? String(body.landingSublineZh) : null,
    landingSublineEn: body.landingSublineEn ? String(body.landingSublineEn) : null,
    landingCtaSecondaryZh: body.landingCtaSecondaryZh ? String(body.landingCtaSecondaryZh) : null,
    landingCtaSecondaryEn: body.landingCtaSecondaryEn ? String(body.landingCtaSecondaryEn) : null,
    landingCtaSecondaryUrlZh: body.landingCtaSecondaryUrlZh ? String(body.landingCtaSecondaryUrlZh) : null,
    landingCtaSecondaryUrlEn: body.landingCtaSecondaryUrlEn ? String(body.landingCtaSecondaryUrlEn) : null,
    locationZh: body.locationZh ? String(body.locationZh) : null,
    locationEn: body.locationEn ? String(body.locationEn) : null,
    location: body.location ? String(body.location) : body.locationZh ? String(body.locationZh) : null,
    avatar: body.avatar ? String(body.avatar) : null,
    favicon: body.favicon ? String(body.favicon) : null,
    primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
    backgroundColor: body.backgroundColor ? String(body.backgroundColor) : undefined,
    seoTitle: body.seoTitle ? String(body.seoTitle) : body.seoTitleZh ? String(body.seoTitleZh) : null,
    seoDescription: body.seoDescription ? String(body.seoDescription) : body.seoDescriptionZh ? String(body.seoDescriptionZh) : null,
    seoTitleZh: body.seoTitleZh ? String(body.seoTitleZh) : null,
    seoTitleEn: body.seoTitleEn ? String(body.seoTitleEn) : null,
    seoDescriptionZh: body.seoDescriptionZh ? String(body.seoDescriptionZh) : null,
    seoDescriptionEn: body.seoDescriptionEn ? String(body.seoDescriptionEn) : null,
    worksPageSize: normalizeWorksPageSize(body.worksPageSize),
    defaultLocale: body.defaultLocale === "en" ? "en" : "zh"
  };
}

export async function GET() {
  const profile = await prisma.profile.findFirst({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as Record<string, unknown>;
  const data = mapProfilePayload(body);
  const existing = await prisma.profile.findFirst({ orderBy: { createdAt: "asc" } });

  if (!existing) {
    const created = await prisma.profile.create({
      data: data as Prisma.ProfileCreateInput
    });
    return NextResponse.json(created);
  }

  const updated = await prisma.profile.update({
    where: { id: existing.id },
    data: data as Prisma.ProfileUpdateInput
  });

  return NextResponse.json(updated);
}
