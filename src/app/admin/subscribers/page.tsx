import { prisma } from "@/lib/db";
import { NewsletterStatsChart } from "@/components/admin/newsletter-stats-chart";
import { SubscribersManager } from "@/components/admin/subscribers-manager";
import { requireAdminPage } from "@/lib/permissions";

export default async function AdminSubscribersPage() {
  await requireAdminPage();
  const [stats, latest, sentRows, openedRows, clickedRows] = await Promise.all([
    prisma.subscriber.groupBy({ by: ["status"], _count: true }),
    prisma.subscriber.findMany({ orderBy: { subscribedAt: "desc" } }),
    prisma.emailLog.groupBy({ by: ["type"], _count: true }),
    prisma.emailLog.groupBy({ by: ["type"], _count: true, where: { openedAt: { not: null } } }),
    prisma.emailLog.groupBy({ by: ["type"], _count: true, where: { clickedAt: { not: null } } })
  ]);

  const types = ["verify", "welcome", "new_post"] as const;
  const typeStats = types.map((type) => {
    const sent = sentRows.find((row) => row.type === type)?._count ?? 0;
    const opened = openedRows.find((row) => row.type === type)?._count ?? 0;
    const clicked = clickedRows.find((row) => row.type === type)?._count ?? 0;

    return {
      type,
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0
    };
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold">邮件订阅</h2>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {stats.map((row) => (
          <span key={row.status} className="rounded-full bg-slate-100 px-3 py-1">
            {row.status}: {row._count}
          </span>
        ))}
      </div>
      <NewsletterStatsChart rows={typeStats} />
      <div className="mt-4 grid gap-2">
        <SubscribersManager
          initial={latest.map((item) => ({
            id: item.id,
            email: item.email,
            status: item.status
          }))}
        />
      </div>
    </div>
  );
}
