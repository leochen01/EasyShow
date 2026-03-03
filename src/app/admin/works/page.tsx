import dynamic from "next/dynamic";

import { prisma } from "@/lib/db";
import type { WorkItem } from "@/components/admin/works-manager";
import { requireAdminPage } from "@/lib/permissions";

const WorksManager = dynamic(
  () => import("@/components/admin/works-manager").then((mod) => mod.WorksManager),
  {
    ssr: false,
    loading: () => (
      <div className="mt-4 grid gap-3">
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="h-[420px] w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    )
  }
);

export default async function AdminWorksPage() {
  await requireAdminPage();
  const works = await prisma.work.findMany({ orderBy: { publishDate: "desc" } });
  const initial: WorkItem[] = works.map((item) => ({
    id: item.id,
    type: item.type,
    titleZh: item.titleZh,
    titleEn: item.titleEn,
    descriptionZh: item.descriptionZh,
    descriptionEn: item.descriptionEn,
    contentZh: item.contentZh,
    contentEn: item.contentEn,
    tags: item.tags,
    category: item.category,
    coverImage: item.coverImage,
    demoLink: item.demoLink,
    slug: item.slug,
    publishDate: item.publishDate.toISOString().slice(0, 10),
    visible: item.visible,
    featured: item.featured
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold">作品管理</h2>
      <WorksManager initial={initial} />
    </div>
  );
}
