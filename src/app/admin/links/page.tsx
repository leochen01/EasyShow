import { prisma } from "@/lib/db";
import { LinksManager } from "@/components/admin/links-manager";
import { requireAdminPage } from "@/lib/permissions";

export default async function AdminLinksPage() {
  await requireAdminPage();
  const links = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h2 className="text-2xl font-semibold">社交链接管理</h2>
      <LinksManager initial={links} />
    </div>
  );
}
