import { WorkType } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import type { AppLocale } from "@/lib/locale";

const profileSelect = {
  id: true,
  nameZh: true,
  titleZh: true,
  bioZh: true,
  nameEn: true,
  titleEn: true,
  bioEn: true,
  landingKickerZh: true,
  landingKickerEn: true,
  landingHeadlineZh: true,
  landingHeadlineEn: true,
  landingSublineZh: true,
  landingSublineEn: true,
  landingCtaSecondaryZh: true,
  landingCtaSecondaryEn: true,
  landingCtaSecondaryUrlZh: true,
  landingCtaSecondaryUrlEn: true,
  locationZh: true,
  locationEn: true,
  location: true,
  avatar: true,
  favicon: true,
  defaultLocale: true,
  primaryColor: true,
  backgroundColor: true,
  seoTitle: true,
  seoDescription: true,
  seoTitleZh: true,
  seoTitleEn: true,
  seoDescriptionZh: true,
  seoDescriptionEn: true,
  worksPageSize: true,
  createdAt: true
} as const;

const workCardSelect = {
  id: true,
  slug: true,
  titleZh: true,
  titleEn: true,
  descriptionZh: true,
  descriptionEn: true,
  type: true,
  coverImage: true,
  demoLink: true,
  category: true,
  publishDate: true,
  tags: true
} as const;

const profileQuery = unstable_cache(
  async () => prisma.profile.findFirst({ orderBy: { createdAt: "asc" }, select: profileSelect }),
  ["content-profile"],
  { revalidate: 60 }
);

const visibleLinksQuery = unstable_cache(
  async () =>
    prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, label: true, url: true }
    }),
  ["content-visible-links"],
  { revalidate: 60 }
);

const featuredWorksQuery = unstable_cache(
  async (limit?: number) =>
    prisma.work.findMany({
      where: { visible: true, featured: true },
      orderBy: { publishDate: "desc" },
      ...(typeof limit === "number" ? { take: limit } : {}),
      select: workCardSelect
    }),
  ["content-featured-works"],
  { revalidate: 60 }
);

const latestWorksQuery = unstable_cache(
  async (limit: number, type?: WorkType) =>
    prisma.work.findMany({
      where: { visible: true, ...(type ? { type } : {}) },
      orderBy: { publishDate: "desc" },
      take: limit,
      select: workCardSelect
    }),
  ["content-latest-works"],
  { revalidate: 60 }
);

const workBySlugQuery = unstable_cache(
  async (slug: string) =>
    prisma.work.findFirst({
      where: { OR: [{ slug }, { slugZh: slug }, { slugEn: slug }] },
      select: {
        id: true,
        slug: true,
        slugZh: true,
        slugEn: true,
        titleZh: true,
        titleEn: true,
        descriptionZh: true,
        descriptionEn: true,
        contentZh: true,
        contentEn: true,
        type: true,
        publishDate: true,
        tags: true,
        demoLink: true,
        sourceLink: true,
        downloadLink: true,
        articleLink: true
      }
    }),
  ["content-work-by-slug"],
  { revalidate: 60 }
);

const visibleWorkSlugsQuery = unstable_cache(
  async () => {
    const works = await prisma.work.findMany({
      where: { visible: true },
      select: { slug: true, slugZh: true, slugEn: true }
    });

    const map = new Map<string, { slug: string }>();
    for (const work of works) {
      if (work.slug) map.set(work.slug, { slug: work.slug });
      if (work.slugZh) map.set(work.slugZh, { slug: work.slugZh });
      if (work.slugEn) map.set(work.slugEn, { slug: work.slugEn });
    }
    return Array.from(map.values());
  },
  ["content-visible-work-slugs"],
  { revalidate: 60 }
);

export async function getProfile() {
  return profileQuery();
}

export async function getVisibleLinks() {
  return visibleLinksQuery();
}

export async function getFeaturedWorks(limit?: number) {
  return featuredWorksQuery(limit);
}

export async function getLatestWorks(limit = 6, type?: WorkType) {
  return latestWorksQuery(limit, type);
}

export async function getWorkBySlug(slug: string) {
  return workBySlugQuery(slug);
}

export async function getVisibleWorkSlugs() {
  return visibleWorkSlugsQuery();
}

export function pickLocaleText<T extends { [key: string]: unknown }>(
  locale: AppLocale,
  zhKey: keyof T,
  enKey: keyof T
) {
  return (locale === "en" ? (enKey as string) : (zhKey as string)) as keyof T;
}
