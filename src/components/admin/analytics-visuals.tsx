"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TrendRow = { date: string; visits: number };
type SliceRow = { name: string; value: number };
type TopWorkRow = { name: string; views: number };

const pieColors = ["#3b82f6", "#22c55e", "#f59e0b", "#64748b", "#8b5cf6"];

export function AnalyticsVisuals({
  trend,
  source,
  country,
  topWorks
}: {
  trend: TrendRow[];
  source: SliceRow[];
  country: SliceRow[];
  topWorks: TopWorkRow[];
}) {
  return (
    <div className="mt-6 grid gap-4">
      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="mb-3 font-semibold">近 30 天访问趋势</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 font-semibold">来源分布</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={source} dataKey="value" nameKey="name" outerRadius={90}>
                  {source.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 font-semibold">访客地区分布</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={country} dataKey="value" nameKey="name" outerRadius={90}>
                  {country.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="mb-3 font-semibold">热门作品（按浏览量）</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={topWorks} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-12} textAnchor="end" height={52} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="views" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
