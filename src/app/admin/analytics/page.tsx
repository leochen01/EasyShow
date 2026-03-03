import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/permissions";
import { AnalyticsVisuals } from "@/components/admin/analytics-visuals";
import { AnalyticsRankingLists } from "@/components/admin/analytics-ranking-lists";

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const [total, today, topPages, topWorksChart, topWorksList, recentAnalytics] = await Promise.all([
    prisma.analytics.count(),
    prisma.analytics.count({ where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.analytics.groupBy({
      by: ["pathname"],
      _count: { pathname: true },
      orderBy: { _count: { pathname: "desc" } }
    }),
    prisma.work.findMany({ orderBy: { views: "desc" }, take: 10 }),
    prisma.work.findMany({ orderBy: { views: "desc" } }),
    prisma.analytics.findMany({
      where: { timestamp: { gte: start } },
      select: { timestamp: true, referrer: true, country: true },
      orderBy: { timestamp: "asc" }
    })
  ]);

  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(5, 10);
    trendMap.set(key, 0);
  }

  const sourceMap = new Map<string, number>([
    ["direct", 0],
    ["search", 0],
    ["social", 0],
    ["other", 0]
  ]);

  const countryMap = new Map<string, number>();

  for (const row of recentAnalytics) {
    const dayKey = row.timestamp.toISOString().slice(5, 10);
    trendMap.set(dayKey, (trendMap.get(dayKey) ?? 0) + 1);

    const ref = (row.referrer || "").toLowerCase();
    let source = "direct";
    if (ref.includes("google.") || ref.includes("bing.") || ref.includes("baidu.")) {
      source = "search";
    } else if (
      ref.includes("x.com") ||
      ref.includes("twitter.com") ||
      ref.includes("youtube.com") ||
      ref.includes("bilibili.com") ||
      ref.includes("xiaohongshu.com") ||
      ref.includes("zhihu.com") ||
      ref.includes("juejin.cn")
    ) {
      source = "social";
    } else if (ref) {
      source = "other";
    }
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);

    const country = row.country?.trim() || "Unknown";
    countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
  }

  const trend = Array.from(trendMap.entries()).map(([date, visits]) => ({ date, visits }));
  const source = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));
  const country = Array.from(countryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
  const topWorksChartRows = topWorksChart.map((item) => ({ name: item.titleZh, views: item.views }));

  return (
    <div>
      <h2 className="text-2xl font-semibold">数据统计</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="总访问" value={total} />
        <Stat label="今日访问" value={today} />
        <Stat label="近30天起点" value={start.toISOString().slice(0, 10)} />
        <Stat label="热门作品数" value={topWorksList.length} />
      </div>

      <AnalyticsVisuals trend={trend} source={source} country={country} topWorks={topWorksChartRows} />

      <AnalyticsRankingLists
        pages={topPages.map((item) => ({
          pathname: item.pathname,
          count: item._count.pathname
        }))}
        works={topWorksList.map((item) => ({
          id: item.id,
          title: item.titleZh,
          views: item.views
        }))}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
