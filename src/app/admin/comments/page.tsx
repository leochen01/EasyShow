import { prisma } from "@/lib/db";
import { CommentsManager } from "@/components/admin/comments-manager";
import { requireAdminPage } from "@/lib/permissions";

export default async function AdminCommentsPage() {
  await requireAdminPage();
  const comments = await prisma.comment.findMany({
    include: { work: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold">留言管理</h2>
      <CommentsManager
        initial={comments.map((item) => ({
          id: item.id,
          author: item.author,
          email: item.email,
          content: item.content,
          status: item.status,
          workTitle: item.work?.titleZh,
          createdAt: item.createdAt.toISOString()
        }))}
      />
    </div>
  );
}
