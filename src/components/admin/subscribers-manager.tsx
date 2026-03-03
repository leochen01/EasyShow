"use client";

import { useEffect, useMemo, useState } from "react";

type SubscriberItem = {
  id: string;
  email: string;
  status: "pending" | "active" | "unsubscribed";
};

export function SubscribersManager({ initial }: { initial: SubscriberItem[] }) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriberItem["status"]>("all");
  const [keyword, setKeyword] = useState("");
  const [pageSize, setPageSize] = useState<5 | 10 | 20 | 50 | 100>(20);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      return item.email.toLowerCase().includes(q);
    });
  }, [items, keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, keyword, pageSize]);

  async function updateStatus(id: string, status: SubscriberItem["status"]) {
    const response = await fetch(`/api/subscribers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      setMessage("更新失败");
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setMessage("已更新");
  }

  async function remove(id: string) {
    if (!window.confirm("确认删除该订阅者？此操作不可恢复。")) return;

    const response = await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("删除失败");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setMessage("已删除");
  }

  return (
    <div className="mt-4 grid gap-2">
      <div className="text-sm text-slate-500">{message}</div>
      <div className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[180px_minmax(0,1fr)]">
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | SubscriberItem["status"])}
        >
          <option value="all">全部状态</option>
          <option value="pending">pending</option>
          <option value="active">active</option>
          <option value="unsubscribed">unsubscribed</option>
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="搜索邮箱"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>共 {filtered.length} 条结果</span>
        <div className="flex items-center gap-2">
          <span>每页</span>
          <select
            className="rounded border border-slate-300 px-2 py-1 text-xs"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value) as 5 | 10 | 20 | 50 | 100)}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">暂无匹配订阅者</div> : null}
      {paged.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm">
          <span className="mr-3 min-w-[220px]">{item.email}</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={item.status}
            onChange={(e) => updateStatus(item.id, e.target.value as SubscriberItem["status"])}
          >
            <option value="pending">pending</option>
            <option value="active">active</option>
            <option value="unsubscribed">unsubscribed</option>
          </select>
          <button className="rounded bg-rose-600 px-3 py-1 text-white" onClick={() => remove(item.id)}>
            删除
          </button>
        </div>
      ))}
      {filtered.length > 0 && totalPages > 1 ? (
        <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-700 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`rounded border px-2.5 py-1 text-xs ${p === currentPage ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-700 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            下一页
          </button>
        </div>
      ) : null}
    </div>
  );
}
