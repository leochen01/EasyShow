"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Row = {
  type: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
};

const colors = {
  sent: "#94a3b8",
  opened: "#22c55e",
  clicked: "#3b82f6"
};

function typeLabel(type: string) {
  if (type === "verify") return "验证邮件";
  if (type === "welcome") return "欢迎邮件";
  if (type === "new_post") return "新文章推送";
  return type;
}

export function NewsletterStatsChart({ rows }: { rows: Row[] }) {
  const chartData = rows.map((row) => ({
    ...row,
    label: typeLabel(row.type)
  }));

  return (
    <section className="mt-5 grid gap-4 rounded-xl border border-slate-200 p-4">
      <h3 className="text-lg font-semibold">邮件效果（按类型聚合）</h3>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sent" name="发送量" fill={colors.sent} radius={[4, 4, 0, 0]}>
              {chartData.map((row) => (
                <Cell key={`${row.type}-sent`} fill={colors.sent} />
              ))}
            </Bar>
            <Bar dataKey="opened" name="打开量" fill={colors.opened} radius={[4, 4, 0, 0]}>
              {chartData.map((row) => (
                <Cell key={`${row.type}-opened`} fill={colors.opened} />
              ))}
            </Bar>
            <Bar dataKey="clicked" name="点击量" fill={colors.clicked} radius={[4, 4, 0, 0]}>
              {chartData.map((row) => (
                <Cell key={`${row.type}-clicked`} fill={colors.clicked} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">类型</th>
              <th>发送</th>
              <th>打开</th>
              <th>点击</th>
              <th>打开率</th>
              <th>点击率</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.type} className="border-b">
                <td className="py-2">{row.label}</td>
                <td>{row.sent}</td>
                <td>{row.opened}</td>
                <td>{row.clicked}</td>
                <td>{row.openRate.toFixed(1)}%</td>
                <td>{row.clickRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
