"use client";

import { useEffect, useMemo, useState } from "react";

type CommentItem = {
  id: string;
  author: string;
  email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  workTitle?: string;
  createdAt: string;
};

export function CommentsManager({ initial }: { initial: CommentItem[] }) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CommentItem["status"]>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "home" | "work">("all");
  const [keyword, setKeyword] = useState("");
  const [pageSize, setPageSize] = useState<5 | 10 | 20 | 50 | 100>(20);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      if (scopeFilter === "home" && item.workTitle) return false;
      if (scopeFilter === "work" && !item.workTitle) return false;

      if (!q) return true;
      const haystack = `${item.author} ${item.email} ${item.content} ${item.workTitle ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, keyword, scopeFilter, statusFilter]);

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
  }, [statusFilter, scopeFilter, keyword, pageSize]);

  async function updateStatus(id: string, status: CommentItem["status"]) {
    const response = await fetch(`/api/comments/${id}`, {
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
    if (!window.confirm("确认删除该留言？此操作不可恢复。")) return;

    const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("删除失败");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setMessage("已删除");
  }

  return (
    <div className="mt-4 grid gap-3">
      <div className="text-sm text-slate-500">{message}</div>
      <div className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[180px_180px_minmax(0,1fr)]">
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | CommentItem["status"])}
        >
          <option value="all">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value as "all" | "home" | "work")}
        >
          <option value="all">全部来源</option>
          <option value="home">仅首页留言</option>
          <option value="work">仅作品留言</option>
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="搜索作者 / 邮箱 / 内容 / 作品标题"
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
      {filtered.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">暂无匹配留言</div> : null}
      {paged.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{comment.author}</span>
            <span>·</span>
            <span>{comment.email}</span>
            <span>·</span>
            <StatusBadge status={comment.status} />
            <span>·</span>
            <span>{comment.workTitle ?? "首页留言"}</span>
            <span>·</span>
            <span>
            {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-emerald-600 px-3 py-1 text-sm text-white" onClick={() => updateStatus(comment.id, "approved")}>
              通过
            </button>
            <button className="rounded bg-amber-600 px-3 py-1 text-sm text-white" onClick={() => updateStatus(comment.id, "pending")}>
              待审
            </button>
            <button className="rounded bg-rose-600 px-3 py-1 text-sm text-white" onClick={() => updateStatus(comment.id, "rejected")}>
              拒绝
            </button>
            <button className="rounded bg-slate-900 px-3 py-1 text-sm text-white" onClick={() => remove(comment.id)}>
              删除
            </button>
          </div>
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

function StatusBadge({ status }: { status: CommentItem["status"] }) {
  if (status === "approved") {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">已通过</span>;
  }
  if (status === "rejected") {
    return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">已拒绝</span>;
  }
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">待审核</span>;
}
