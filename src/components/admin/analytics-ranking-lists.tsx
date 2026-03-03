"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type PageRow = { pathname: string; count: number };
type WorkRow = { id: string; title: string; views: number };
type PageSize = 5 | 10 | 20 | 50 | 100;

export function AnalyticsRankingLists({
  pages,
  works
}: {
  pages: PageRow[];
  works: WorkRow[];
}) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <PagedList
        title="热门页面"
        items={pages}
        keyExtractor={(item) => item.pathname}
        renderItem={(item) => (
          <>
            <span className="truncate">{item.pathname}</span>
            <span className="text-slate-500">{item.count}</span>
          </>
        )}
      />
      <PagedList
        title="热门作品"
        items={works}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <>
            <span className="truncate">{item.title}</span>
            <span className="text-slate-500">{item.views}</span>
          </>
        )}
      />
    </div>
  );
}

function PagedList<T>({
  title,
  items,
  keyExtractor,
  renderItem
}: {
  title: string;
  items: T[];
  keyExtractor?: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
}) {
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, items.length]);

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>每页</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {pagedItems.map((item, index) => (
          <li
            key={keyExtractor ? keyExtractor(item) : `${title}-${(currentPage - 1) * pageSize + index}`}
            className="flex items-center justify-between gap-2"
          >
            {renderItem(item)}
          </li>
        ))}
      </ul>

      {items.length === 0 ? <div className="text-sm text-slate-500">暂无数据</div> : null}

      {items.length > 0 && totalPages > 1 ? (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
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
