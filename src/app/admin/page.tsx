import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/permissions";

export default async function AdminDashboard() {
  await requireAdminPage();

  const [totalWorks, thisMonthWorks, totalComments, totalSubscribers] = await Promise.all([
    prisma.work.count(),
    prisma.work.count({
      where: {
        publishDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.comment.count(),
    prisma.subscriber.count({ where: { status: "active" } })
  ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold">仪表盘</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Card label="总作品数" value={totalWorks} />
        <Card label="本月新增" value={thisMonthWorks} />
        <Card label="留言数" value={totalComments} />
        <Card label="活跃订阅" value={totalSubscribers} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}
