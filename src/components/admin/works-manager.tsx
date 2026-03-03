"use client";

import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

type WorkType = "article" | "video" | "software" | "tool";

export type WorkItem = {
  id: string;
  type: WorkType;
  titleZh: string;
  titleEn: string;
  descriptionZh: string | null;
  descriptionEn: string | null;
  contentZh: string | null;
  contentEn: string | null;
  tags: string;
  category: string | null;
  coverImage: string | null;
  demoLink: string | null;
  slug: string;
  publishDate: string;
  visible: boolean;
  featured: boolean;
};

const typeOptions: WorkType[] = ["article", "video", "software", "tool"];

function isLinkCardType(type: WorkType) {
  return type === "software" || type === "tool";
}

function linkCardTypeLabel(type: WorkType, locale: "zh" | "en" = "zh") {
  if (locale === "zh") return type === "tool" ? "工具" : "软件";
  return type === "tool" ? "tool" : "software";
}

function getVideoEmbedInfo(url?: string | null): { platform: "youtube" | "bilibili"; embedUrl: string } | null {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        const id = parsed.searchParams.get("v");
        if (!id) return null;
        return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        if (!id) return null;
        return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/")[2];
        if (!id) return null;
        return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
      }
    }

    if (host.includes("bilibili.com")) {
      const match = parsed.pathname.match(/\/video\/(BV[0-9A-Za-z]+|av\d+)/i);
      if (!match) return null;

      const videoId = match[1];
      const page = parsed.searchParams.get("p") || "1";
      if (videoId.toLowerCase().startsWith("av")) {
        const aid = videoId.slice(2);
        return { platform: "bilibili", embedUrl: `https://player.bilibili.com/player.html?aid=${aid}&page=${page}` };
      }
      return { platform: "bilibili", embedUrl: `https://player.bilibili.com/player.html?bvid=${videoId}&page=${page}` };
    }
  } catch {
    return null;
  }

  return null;
}

function emptyDraft(): Omit<WorkItem, "id"> {
  const now = new Date().toISOString().slice(0, 10);
  return {
    type: "article",
    titleZh: "",
    titleEn: "",
    descriptionZh: "",
    descriptionEn: "",
    contentZh: "# 中文内容\n\n在这里编写 Markdown",
    contentEn: "# English Content\n\nWrite markdown here",
    tags: "",
    category: "",
    coverImage: "",
    demoLink: "",
    slug: "",
    publishDate: now,
    visible: true,
    featured: false
  };
}

export function WorksManager({ initial }: { initial: WorkItem[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState(emptyDraft());
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [listTypeFilter, setListTypeFilter] = useState<"all" | WorkType>("all");
  const [listCategoryFilter, setListCategoryFilter] = useState("all");
  const [listKeyword, setListKeyword] = useState("");
  const [listPageSize, setListPageSize] = useState<5 | 10 | 20 | 50 | 100>(20);
  const [listPage, setListPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [createLocale, setCreateLocale] = useState<"zh" | "en">("zh");
  const [editLocale, setEditLocale] = useState<"zh" | "en">("zh");
  const [message, setMessage] = useState("");
  const [editSaveResult, setEditSaveResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState<"zh" | "en" | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate)),
    [items]
  );
  const listCategories = useMemo(() => {
    const source = listTypeFilter === "all" ? sorted : sorted.filter((item) => item.type === listTypeFilter);
    return Array.from(new Set(source.map((item) => (item.category || "").trim()).filter(Boolean))).sort();
  }, [sorted, listTypeFilter]);

  const filteredList = useMemo(() => {
    const keyword = listKeyword.trim().toLowerCase();

    return sorted.filter((item) => {
      const typeMatched = listTypeFilter === "all" ? true : item.type === listTypeFilter;
      if (!typeMatched) return false;
      const category = (item.category || "").trim();
      const categoryMatched = listCategoryFilter === "all" ? true : category === listCategoryFilter;
      if (!categoryMatched) return false;

      if (!keyword) return true;
      const haystack = `${item.titleZh} ${item.titleEn} ${item.slug} ${item.tags} ${item.category || ""}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [sorted, listTypeFilter, listCategoryFilter, listKeyword]);

  useEffect(() => {
    setListPage(1);
  }, [listTypeFilter, listCategoryFilter, listKeyword, listPageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / listPageSize));
  const currentPage = Math.min(listPage, totalPages);
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * listPageSize;
    return filteredList.slice(start, start + listPageSize);
  }, [currentPage, filteredList, listPageSize]);

  useEffect(() => {
    if (listPage > totalPages) setListPage(totalPages);
  }, [listPage, totalPages]);

  const selected = sorted.find((item) => item.id === selectedId) ?? null;

  async function uploadImage(file: File, locale: "zh" | "en"): Promise<string | null> {
    setUploading(locale);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        setMessage("图片上传失败");
        return null;
      }

      const payload = (await response.json()) as { url: string };
      setMessage(`图片上传成功：${payload.url}`);
      return payload.url;
    } finally {
      setUploading(null);
    }
  }

  async function uploadSoftwareIcon(file: File, mode: "create" | "edit") {
    const url = await uploadImage(file, "zh");
    if (!url) return;

    if (mode === "create") {
      setDraft((prev) => ({ ...prev, coverImage: url }));
    } else if (selected) {
      setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, coverImage: url } : row)));
    }
  }

  async function create() {
    const payload = {
      ...draft,
      contentZh: draft.contentZh,
      contentEn: draft.contentEn,
      category: draft.category || null,
      slugZh: draft.slug,
      slugEn: draft.slug,
      tags: draft.tags
    };
    const response = await fetch("/api/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setMessage("新建失败（请检查 slug 是否重复）");
      return;
    }

    const created = (await response.json()) as Omit<WorkItem, "publishDate"> & { publishDate: string | Date };
    const normalized: WorkItem = {
      ...created,
      publishDate: new Date(created.publishDate).toISOString().slice(0, 10)
    };
    setItems((prev) => [normalized, ...prev]);
    setSelectedId(normalized.id);
    setDraft(emptyDraft());
    setCreateOpen(false);
    setMessage("新建成功");
  }

  async function update(item: WorkItem) {
    const payload = {
      ...item,
      contentZh: item.contentZh,
      contentEn: item.contentEn,
      category: item.category || null,
      slugZh: item.slug,
      slugEn: item.slug,
      publishDate: item.publishDate
    };
    const response = await fetch(`/api/works/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setEditSaveResult(response.ok ? { ok: true, text: "保存成功" } : { ok: false, text: "保存失败" });
  }

  async function remove(id: string, title?: string) {
    const label = title?.trim() ? `「${title.trim()}」` : "该作品";
    if (!window.confirm(`确认删除${label}？此操作不可恢复。`)) return;

    const response = await fetch(`/api/works/${id}`, { method: "DELETE" });
    if (response.ok) {
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      setSelectedId(next[0]?.id ?? null);
      setMessage("已删除");
    } else {
      setMessage("删除失败");
    }
  }

  return (
    <div className="mt-4 grid gap-6">
      {createOpen ? (
        <div className="fixed inset-0 z-[130] bg-slate-900/55 p-2 md:p-6" onClick={() => setCreateOpen(false)}>
          <section
            className="h-full overflow-auto rounded-2xl bg-white p-4 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">新建作品（全屏工作台）</h3>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <select
                className="rounded border border-slate-300 px-3 py-2"
                value={draft.type}
                onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value as WorkType }))}
              >
                {typeOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <input
                className="rounded border border-slate-300 px-3 py-2"
                placeholder="slug"
                value={draft.slug}
                onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2"
                placeholder="中文标题"
                value={draft.titleZh}
                onChange={(e) => setDraft((prev) => ({ ...prev, titleZh: e.target.value }))}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2"
                placeholder="English title"
                value={draft.titleEn}
                onChange={(e) => setDraft((prev) => ({ ...prev, titleEn: e.target.value }))}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                placeholder="中文简介"
                value={draft.descriptionZh ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, descriptionZh: e.target.value }))}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                placeholder="English description"
                value={draft.descriptionEn ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, descriptionEn: e.target.value }))}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                placeholder="标签（逗号分隔）"
                value={draft.tags}
                onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                placeholder="二级分类（如：AI实战 / 金融数字人 / 效率工具）"
                value={draft.category ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
              />
              <input
                type="date"
                className="rounded border border-slate-300 px-3 py-2"
                value={draft.publishDate}
                onChange={(e) => setDraft((prev) => ({ ...prev, publishDate: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.visible}
                  onChange={(e) => setDraft((prev) => ({ ...prev, visible: e.target.checked }))}
                />
                可见
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                推荐
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              {isLinkCardType(draft.type) ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    <span className="text-slate-500">{linkCardTypeLabel(draft.type)}网址（点击卡片跳转）</span>
                    <input
                      className="rounded border border-slate-300 px-3 py-2"
                      placeholder="https://example.com"
                      value={draft.demoLink ?? ""}
                      onChange={(e) => setDraft((prev) => ({ ...prev, demoLink: e.target.value }))}
                    />
                  </label>

                  <div className="grid gap-2 text-sm">
                    <span className="text-slate-500">{linkCardTypeLabel(draft.type)}图标</span>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {draft.coverImage ? (
                          <img src={draft.coverImage} alt={`${linkCardTypeLabel(draft.type, "en")} icon`} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <label className="cursor-pointer rounded bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-700">
                        上传图标
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={async (e) => {
                            const input = e.currentTarget;
                            const file = e.target.files?.[0];
                            if (file) await uploadSoftwareIcon(file, "create");
                            input.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <input
                      className="rounded border border-slate-300 px-3 py-2"
                      placeholder="或直接填写图标 URL"
                      value={draft.coverImage ?? ""}
                      onChange={(e) => setDraft((prev) => ({ ...prev, coverImage: e.target.value }))}
                    />
                  </div>
                </div>
              ) : null}

              {draft.type === "video" ? (
                <VideoEmbedEditor
                  value={draft.demoLink ?? ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, demoLink: value }))}
                />
              ) : null}

              <div className="mb-3 mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">正文编辑</div>
                <div className="inline-flex rounded-full border border-slate-300 p-1 text-xs">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 ${createLocale === "zh" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                    onClick={() => setCreateLocale("zh")}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 ${createLocale === "en" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                    onClick={() => setCreateLocale("en")}
                  >
                    EN
                  </button>
                </div>
              </div>

              {createLocale === "zh" ? (
                <MarkdownEditor
                  label="中文 Markdown"
                  value={draft.contentZh ?? ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, contentZh: value }))}
                  onUploadFile={(file) => uploadImage(file, "zh")}
                  uploading={uploading === "zh"}
                />
              ) : (
                <MarkdownEditor
                  label="English Markdown"
                  value={draft.contentEn ?? ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, contentEn: value }))}
                  onUploadFile={(file) => uploadImage(file, "en")}
                  uploading={uploading === "en"}
                />
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={create}>
                创建
              </button>
              <span className="self-center text-sm text-slate-500">{message}</span>
              <button
                type="button"
                className="rounded bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                onClick={() => setCreateOpen(false)}
              >
                关闭
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="grid gap-4">
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold">作品列表</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">点击作品进入全屏编辑</span>
              <button
                type="button"
                className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
                onClick={() => setCreateOpen(true)}
              >
                + 新建作品
              </button>
            </div>
          </div>
          <div className="mb-3 grid gap-2 md:grid-cols-[160px_180px_minmax(0,1fr)]">
            <select
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              value={listTypeFilter}
              onChange={(e) => {
                setListTypeFilter(e.target.value as "all" | WorkType);
                setListCategoryFilter("all");
              }}
            >
              <option value="all">全部类型</option>
              {typeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              value={listCategoryFilter}
              onChange={(e) => setListCategoryFilter(e.target.value)}
            >
              <option value="all">全部二级分类</option>
              {listCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="搜索标题 / slug / 标签 / 二级分类"
              value={listKeyword}
              onChange={(e) => setListKeyword(e.target.value)}
            />
          </div>
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span>共 {filteredList.length} 条</span>
            <div className="flex items-center gap-2">
              <span>每页</span>
              <select
                className="rounded border border-slate-300 px-2 py-1 text-xs"
                value={listPageSize}
                onChange={(e) => setListPageSize(Number(e.target.value) as 5 | 10 | 20 | 50 | 100)}
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            {filteredList.length === 0 ? <p className="text-sm text-slate-500">无匹配结果</p> : null}
            {pagedList.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm ${
                  selectedId === item.id ? "border-slate-900 bg-slate-100" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setEditSaveResult(null);
                    setEditOpen(true);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="truncate font-medium">{item.titleZh}</div>
                    {item.featured ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">推荐</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.type}
                    {item.category ? ` / ${item.category}` : ""}
                    {" · "}
                    {item.publishDate}
                  </div>
                </button>
                <button
                  type="button"
                  className="rounded bg-rose-600 px-2.5 py-1.5 text-xs text-white hover:bg-rose-700"
                  onClick={() => remove(item.id, item.titleZh || item.titleEn)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
          {filteredList.length > 0 && totalPages > 1 ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-700 disabled:opacity-40"
                onClick={() => setListPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`rounded border px-2.5 py-1 text-xs ${
                    page === currentPage ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"
                  }`}
                  onClick={() => setListPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-700 disabled:opacity-40"
                onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                下一页
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {editOpen && selected ? (
        <div className="fixed inset-0 z-[130] bg-slate-900/55 p-2 md:p-6" onClick={() => setEditOpen(false)}>
          <section
            className="h-full overflow-auto rounded-2xl bg-white p-4 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">编辑作品（全屏工作台）</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <select
                  className="rounded border border-slate-300 px-3 py-2"
                  value={selected.type}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, type: e.target.value as WorkType } : row)))
                  }
                >
                  {typeOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={selected.slug}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, slug: e.target.value } : row)))
                  }
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={selected.titleZh}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, titleZh: e.target.value } : row)))
                  }
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2"
                  value={selected.titleEn}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, titleEn: e.target.value } : row)))
                  }
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                  value={selected.descriptionZh ?? ""}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, descriptionZh: e.target.value } : row)))
                  }
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                  value={selected.descriptionEn ?? ""}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, descriptionEn: e.target.value } : row)))
                  }
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                  value={selected.tags}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, tags: e.target.value } : row)))
                  }
                />
                <input
                  className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
                  placeholder="二级分类"
                  value={selected.category ?? ""}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, category: e.target.value } : row)))
                  }
                />
                <input
                  type="date"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={selected.publishDate}
                  onChange={(e) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, publishDate: e.target.value } : row)))
                  }
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.visible}
                    onChange={(e) =>
                      setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, visible: e.target.checked } : row)))
                    }
                  />
                  可见
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.featured}
                    onChange={(e) =>
                      setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, featured: e.target.checked } : row)))
                    }
                  />
                  推荐
                </label>
              </div>

              {isLinkCardType(selected.type) ? (
                <div className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    <span className="text-slate-500">{linkCardTypeLabel(selected.type)}网址（点击卡片跳转）</span>
                    <input
                      className="rounded border border-slate-300 px-3 py-2"
                      value={selected.demoLink ?? ""}
                      onChange={(e) =>
                        setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, demoLink: e.target.value } : row)))
                      }
                    />
                  </label>

                  <div className="grid gap-2 text-sm">
                    <span className="text-slate-500">{linkCardTypeLabel(selected.type)}图标</span>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {selected.coverImage ? (
                          <img src={selected.coverImage} alt={`${linkCardTypeLabel(selected.type, "en")} icon`} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <label className="cursor-pointer rounded bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-700">
                        上传图标
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={async (e) => {
                            const input = e.currentTarget;
                            const file = e.target.files?.[0];
                            if (file) await uploadSoftwareIcon(file, "edit");
                            input.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <input
                      className="rounded border border-slate-300 px-3 py-2"
                      placeholder="或直接填写图标 URL"
                      value={selected.coverImage ?? ""}
                      onChange={(e) =>
                        setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, coverImage: e.target.value } : row)))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {selected.type === "video" ? (
                <VideoEmbedEditor
                  value={selected.demoLink ?? ""}
                  onChange={(value) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, demoLink: value } : row)))
                  }
                />
              ) : null}

              <div className="mb-3 mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">正文编辑</div>
                <div className="inline-flex rounded-full border border-slate-300 p-1 text-xs">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 ${editLocale === "zh" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                    onClick={() => setEditLocale("zh")}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 ${editLocale === "en" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                    onClick={() => setEditLocale("en")}
                  >
                    EN
                  </button>
                </div>
              </div>

              {editLocale === "zh" ? (
                <MarkdownEditor
                  label="中文 Markdown"
                  value={selected.contentZh ?? ""}
                  onChange={(value) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, contentZh: value } : row)))
                  }
                  onUploadFile={(file) => uploadImage(file, "zh")}
                  uploading={uploading === "zh"}
                />
              ) : (
                <MarkdownEditor
                  label="English Markdown"
                  value={selected.contentEn ?? ""}
                  onChange={(value) =>
                    setItems((prev) => prev.map((row) => (row.id === selected.id ? { ...row, contentEn: value } : row)))
                  }
                  onUploadFile={(file) => uploadImage(file, "en")}
                  uploading={uploading === "en"}
                />
              )}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => update(selected)}>
                  保存更新
                </button>
                <button
                  className="rounded bg-rose-600 px-3 py-2 text-sm text-white"
                  onClick={() => remove(selected.id, selected.titleZh || selected.titleEn)}
                >
                  删除作品
                </button>
                {editSaveResult ? (
                  <span className={`self-center text-sm ${editSaveResult.ok ? "text-emerald-600" : "text-rose-600"}`}>
                    {editSaveResult.text}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="rounded bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                  onClick={() => {
                    setEditOpen(false);
                    setEditSaveResult(null);
                  }}
                >
                  关闭
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function VideoEmbedEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const embed = getVideoEmbedInfo(value);

  return (
    <div className="mb-3 grid gap-3 rounded-xl border border-slate-200 p-3">
      <label className="grid gap-2 text-sm">
        <span className="text-slate-500">视频链接（支持 Bilibili / YouTube）</span>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="https://www.bilibili.com/video/BV... 或 https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>

      {embed ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
            已识别平台：{embed.platform === "youtube" ? "YouTube" : "Bilibili"}
          </div>
          <div className="aspect-video w-full">
            <iframe
              src={embed.embedUrl}
              title="video preview"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : value.trim() ? (
        <div className="text-xs text-amber-600">暂无法识别为可嵌入链接，请粘贴标准 Bilibili / YouTube 视频地址。</div>
      ) : null}
    </div>
  );
}

function MarkdownEditor({
  label,
  value,
  onChange,
  onUploadFile,
  uploading
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUploadFile: (file: File) => Promise<string | null>;
  uploading: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [tip, setTip] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  function applySelection(transform: (selected: string) => { text: string; selectOffset?: number }) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const result = transform(selected);

    const next = value.slice(0, start) + result.text + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + (result.selectOffset ?? result.text.length);
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function insertHeading() {
    applySelection((selected) => ({ text: `## ${selected || "标题"}` }));
  }

  function insertBold() {
    applySelection((selected) => ({ text: `**${selected || "加粗文本"}**`, selectOffset: selected ? undefined : 2 }));
  }

  function insertCodeBlock() {
    applySelection((selected) => ({
      text: `\n\`\`\`ts\n${selected || "const x = 1;"}\n\`\`\`\n`,
      selectOffset: selected ? undefined : 8
    }));
  }

  function insertLink() {
    applySelection((selected) => ({ text: `[${selected || "链接文本"}](https://example.com)` }));
  }

  function insertTable() {
    applySelection((selected) => ({
      text:
        selected ||
        "\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n"
    }));
  }

  function insertForegroundColor(color: string) {
    applySelection((selected) => ({
      text: `<span style="color: ${color};">${selected || "彩色文本"}</span>`
    }));
  }

  function insertBackgroundColor(color: string) {
    applySelection((selected) => ({
      text: `<span style="background-color: ${color}; padding: 0 2px; border-radius: 2px;">${selected || "高亮文本"}</span>`
    }));
  }

  async function handleUpload(file: File) {
    const url = await onUploadFile(file);
    if (!url) return;
    applySelection(() => ({ text: `\n![image](${url})\n` }));
  }

  async function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();
    setTip("检测到粘贴图片，上传中...");
    await handleUpload(file);
    setTip("已插入粘贴图片");
  }

  function renderEditorPane(fullscreen = false) {
    return (
      <>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex flex-wrap gap-1">
            <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300" onClick={insertHeading}>
              H2
            </button>
            <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300" onClick={insertBold}>
              Bold
            </button>
            <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300" onClick={insertCodeBlock}>
              Code
            </button>
            <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300" onClick={insertLink}>
              Link
            </button>
            <button type="button" className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300" onClick={insertTable}>
              Table
            </button>
            <label className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300">
              A
              <input
                type="color"
                className="h-4 w-5 cursor-pointer border-0 bg-transparent p-0"
                onChange={(event) => insertForegroundColor(event.target.value)}
                title="前景色"
              />
            </label>
            <label className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300">
              Bg
              <input
                type="color"
                className="h-4 w-5 cursor-pointer border-0 bg-transparent p-0"
                onChange={(event) => insertBackgroundColor(event.target.value)}
                title="背景色"
              />
            </label>
            <label className="cursor-pointer rounded bg-slate-900 px-2 py-1 text-xs text-white hover:bg-slate-700">
              {uploading ? "上传中..." : "上传图片"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const file = event.target.files?.[0];
                  if (file) await handleUpload(file);
                  input.value = "";
                }}
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              className="rounded bg-slate-900 px-2 py-1 text-xs text-white hover:bg-slate-700"
              onClick={() => setIsFullscreen((prev) => !prev)}
            >
              {fullscreen ? "退出全屏" : "全屏编辑"}
            </button>
          </div>
        </div>
        <div className="mb-2 text-xs text-slate-500">支持直接粘贴图片自动上传。{tip}</div>
        <div className={`grid gap-3 xl:grid-cols-[1.2fr_1fr] ${fullscreen ? "h-[calc(100vh-170px)]" : ""}`}>
          <textarea
            ref={textareaRef}
            className={`w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm ${
              fullscreen ? "h-full" : "min-h-[520px]"
            }`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={onPaste}
          />
          <div
            className={`markdown-preview overflow-auto rounded border border-slate-200 bg-white p-3 text-sm ${
              fullscreen ? "h-full" : "min-h-[520px]"
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
              {value}
            </ReactMarkdown>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!isFullscreen ? (
        <div className="rounded-lg border border-slate-200 p-3">
          {renderEditorPane()}
        </div>
      ) : null}

      {isFullscreen ? (
        <div className="fixed inset-0 z-[120] bg-slate-900/45 p-3 md:p-6" onClick={() => setIsFullscreen(false)}>
          <div className="h-full rounded-2xl bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            {renderEditorPane(true)}
          </div>
        </div>
      ) : null}
    </>
  );
}
