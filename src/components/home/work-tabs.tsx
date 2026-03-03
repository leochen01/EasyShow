"use client";

import { ArrowUpRight, ExternalLink, Search, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type WorkType = "article" | "video" | "software" | "tool";
type TabType = "featured" | WorkType;

type WorkItem = {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string | null;
  descriptionEn: string | null;
  type: WorkType;
  coverImage: string | null;
  demoLink: string | null;
  category: string | null;
  publishDate: string;
};

const tabOrder: WorkType[] = ["article", "video", "software", "tool"];

function isLinkCardType(type: WorkType | string) {
  return type === "software" || type === "tool";
}

export function WorkTabs({
  locale,
  prefix,
  works,
  primaryColor,
  pageSize = 8,
  embedded,
  featuredWorks
}: {
  locale: "zh" | "en";
  prefix: string;
  works: WorkItem[];
  primaryColor: string;
  pageSize?: number;
  embedded?: boolean;
  featuredWorks: Array<{
    id: string;
    slug: string;
    titleZh: string;
    titleEn: string;
    descriptionZh: string | null;
    descriptionEn: string | null;
    type: string;
    coverImage: string | null;
    demoLink: string | null;
    category: string | null;
    publishDate: string;
    tags: string[];
  }>;
}) {
  const [active, setActive] = useState<TabType>("featured");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const labels = {
    zh: {
      title: "探索内容",
      subtitle: "查看热门内容，或按类型快速筛选",
      featured: "热门",
      article: "文章",
      video: "视频",
      software: "软件",
      tool: "工具",
      empty: "该分类暂无内容",
      read: "查看详情",
      open: "立即访问",
      allSubcategory: "全部分类",
      searchPlaceholder: "搜索标题 / 简介 / 分类",
      clear: "清空",
      prev: "上一页",
      next: "下一页"
    },
    en: {
      title: "Explore Works",
      subtitle: "Browse featured items or filter by content type",
      featured: "Featured",
      article: "Articles",
      video: "Videos",
      software: "Software",
      tool: "Tools",
      empty: "No items in this category",
      read: "Read",
      open: "Open",
      allSubcategory: "All",
      searchPlaceholder: "Search title / summary / category",
      clear: "Clear",
      prev: "Prev",
      next: "Next"
    }
  } as const;

  const subcategories = useMemo(() => {
    if (active === "featured") return [];
    return Array.from(
      new Set(
        works
          .filter((work) => work.type === active)
          .map((work) => (work.category || "").trim())
          .filter(Boolean)
      )
    ).sort();
  }, [works, active]);

  const filtered = useMemo(() => {
    if (active === "featured") return [];
    const query = keyword.trim().toLowerCase();

    return works
      .filter((work) => {
        if (work.type !== active) return false;
        if (activeSubcategory !== "all" && (work.category || "").trim() !== activeSubcategory) return false;
        if (!query) return true;

        const zhTitle = work.titleZh || "";
        const enTitle = work.titleEn || "";
        const zhDesc = work.descriptionZh || "";
        const enDesc = work.descriptionEn || "";
        const category = work.category || "";
        const haystack = `${zhTitle} ${enTitle} ${zhDesc} ${enDesc} ${category}`.toLowerCase();
        return haystack.includes(query);
      });
  }, [works, active, activeSubcategory, keyword]);

  const filteredFeatured = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return featuredWorks;

    return featuredWorks
      .filter((work) => {
        const zhTitle = work.titleZh || "";
        const enTitle = work.titleEn || "";
        const zhDesc = work.descriptionZh || "";
        const enDesc = work.descriptionEn || "";
        const category = work.category || "";
        const tags = work.tags.join(" ");
        const haystack = `${zhTitle} ${enTitle} ${zhDesc} ${enDesc} ${category} ${tags}`.toLowerCase();
        return haystack.includes(query);
      });
  }, [featuredWorks, keyword]);

  useEffect(() => {
    setActiveSubcategory("all");
  }, [active]);

  useEffect(() => {
    setCurrentPage(1);
  }, [active, activeSubcategory, keyword]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  const safePageSize = Math.min(24, Math.max(1, Math.trunc(pageSize || 8)));
  const toWorkHref = (slug: string) => `${prefix}/work/${slug}` as Route;
  const activeItems = active === "featured" ? filteredFeatured : filtered;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / safePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * safePageSize;
  const pageEnd = pageStart + safePageSize;
  const pagedFeatured = filteredFeatured.slice(pageStart, pageEnd);
  const pagedWorks = filtered.slice(pageStart, pageEnd);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const content = (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{labels[locale].title}</h2>
        <p className="mt-1 text-sm text-slate-500">{labels[locale].subtitle}</p>
      </div>

      <div className="sticky top-2 z-20 mt-3 rounded-2xl border border-slate-200/80 bg-white/88 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="tab-shell">
            {(["featured", ...tabOrder] as TabType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActive(type)}
                className={`tab-pill ${active === type ? "is-active" : ""}`}
                style={active === type ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
              >
                {labels[locale][type]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative w-[220px] md:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={labels[locale].searchPlaceholder}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-slate-500"
                />
                {keyword ? (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={labels[locale].clear}
                    title={labels[locale].clear}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label={labels[locale].searchPlaceholder}
              title={labels[locale].searchPlaceholder}
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {active !== "featured" && subcategories.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSubcategory("all")}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                activeSubcategory === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-600"
              }`}
            >
              {labels[locale].allSubcategory}
            </button>
            {subcategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveSubcategory(category)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  activeSubcategory === category ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {active === "featured" ? (
        <div key="featured" className="animate-fade-slide mt-5">
          {filteredFeatured.length === 0 ? <EmptyState text={labels[locale].empty} /> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {pagedFeatured.map((work, idx) => {
              const title = locale === "en" ? work.titleEn : work.titleZh;
              const description = locale === "en" ? work.descriptionEn : work.descriptionZh;
              const isLinkCard = isLinkCardType(work.type);

              return isLinkCard ? (
                <LinkCard
                  key={work.id}
                  locale={locale}
                  type={work.type}
                  title={title}
                  description={description}
                  category={work.category}
                  publishDate={work.publishDate}
                  coverImage={work.coverImage}
                  demoLink={work.demoLink}
                  fallbackHref={toWorkHref(work.slug)}
                />
              ) : (
                <Link
                  key={work.id}
                  href={toWorkHref(work.slug)}
                  className="sub-feature-card group stagger-item"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{title}</h3>
                  {work.category ? <div className="mt-1 text-xs text-slate-500">{work.category}</div> : null}
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{work.publishDate}</span>
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      {labels[locale].read}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div key={active} className="animate-fade-slide mt-5">
          {filtered.length === 0 ? <EmptyState text={labels[locale].empty} /> : null}

          {active === "article" ? (
            <div className="article-list-panel">
              {pagedWorks.map((work, idx) => {
                const title = locale === "en" ? work.titleEn : work.titleZh;
                const description = locale === "en" ? work.descriptionEn : work.descriptionZh;
                return (
                  <Link key={work.id} href={toWorkHref(work.slug)} className="article-row" style={{ animationDelay: `${idx * 55}ms` }}>
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-slate-400" />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{title}</h3>
                      {work.category ? <div className="mt-1 text-xs text-slate-500">{work.category}</div> : null}
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>{work.publishDate}</div>
                      <div className="mt-1 inline-flex items-center gap-1 text-slate-700">
                        {labels[locale].read}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {pagedWorks.map((work, idx) => {
                const title = locale === "en" ? work.titleEn : work.titleZh;
                const description = locale === "en" ? work.descriptionEn : work.descriptionZh;
                const isLinkCard = isLinkCardType(work.type);

                return isLinkCard ? (
                  <div key={work.id} style={{ animationDelay: `${idx * 60}ms` }} className="stagger-item">
                    <LinkCard
                      locale={locale}
                      type={work.type}
                      title={title}
                      description={description}
                      category={work.category}
                      publishDate={work.publishDate}
                      coverImage={work.coverImage}
                      demoLink={work.demoLink}
                      fallbackHref={toWorkHref(work.slug)}
                    />
                  </div>
                ) : (
                  <Link key={work.id} href={toWorkHref(work.slug)} className="media-card stagger-item" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">{work.type}</div>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">{title}</h3>
                    {work.category ? <div className="mt-1 text-xs text-slate-500">{work.category}</div> : null}
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{active === "video" ? work.publishDate : ""}</span>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                        {labels[locale].read}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeItems.length > 0 && totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 disabled:opacity-40"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
          >
            {labels[locale].prev}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`rounded border px-2.5 py-1.5 text-xs ${
                safeCurrentPage === page ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 disabled:opacity-40"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
          >
            {labels[locale].next}
          </button>
        </div>
      ) : null}
    </>
  );

  if (embedded) return content;

  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-sm">
      {content}
    </section>
  );
}

function LinkCard({
  locale,
  type,
  title,
  description,
  category,
  publishDate,
  coverImage,
  demoLink,
  fallbackHref
}: {
  locale: "zh" | "en";
  type: WorkType | string;
  title: string;
  description: string | null;
  category: string | null;
  publishDate: string;
  coverImage: string | null;
  demoLink: string | null;
  fallbackHref: Route;
}) {
  const href = demoLink || fallbackHref;
  const isExternal = !!demoLink;
  const host = demoLink ? extractHost(demoLink) : "";
  const typeLabel = type === "tool" ? "tool" : "software";
  const actionText = isExternal ? (locale === "zh" ? "立即访问" : "Open") : locale === "zh" ? "查看详情" : "Read";

  if (!isExternal) {
    return (
      <Link href={fallbackHref} className="link-card">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
          <span>{typeLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {coverImage ? <img src={coverImage} alt={title} className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
            {category ? <div className="text-xs text-slate-500">{category}</div> : null}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{publishDate}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
            {actionText}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="link-card"
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
        <span>{typeLabel}</span>
        {isExternal ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {coverImage ? <img src={coverImage} alt={title} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>
          {category ? <div className="text-xs text-slate-500">{category}</div> : null}
          {host ? <div className="text-xs text-slate-500">{host}</div> : null}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{publishDate}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
          {actionText}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}

function EmptyState({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 ${compact ? "" : "min-h-[140px]"}`}>
      {text}
    </div>
  );
}

function extractHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}
