import { ExternalLink } from "lucide-react";
import { isValidElement, type HTMLAttributes, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

import { formatDate, toTags } from "@/lib/utils";
import type { AppLocale } from "@/lib/locale";
import { t } from "@/lib/messages";
import { CommentBoard } from "@/components/works/comment-board";
import { BackNavButton } from "@/components/common/back-nav-button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { WorkTocPanel } from "@/components/works/work-toc-panel";

type WorkDetailProps = {
  locale: AppLocale;
  theme?: {
    primaryColor?: string | null;
    backgroundColor?: string | null;
  } | null;
  work: {
    id: string;
    slug: string;
    slugZh?: string | null;
    slugEn?: string | null;
    titleZh: string;
    titleEn: string;
    descriptionZh: string | null;
    descriptionEn: string | null;
    contentZh: string | null;
    contentEn: string | null;
    type: string;
    publishDate: Date;
    tags: string;
    demoLink: string | null;
    sourceLink: string | null;
    downloadLink: string | null;
    articleLink: string | null;
  };
};

export function WorkDetail({ locale, work, theme }: WorkDetailProps) {
  const prefix = locale === "en" ? "/en" : "";
  const zhSlug = work.slugZh || work.slug;
  const enSlug = work.slugEn || work.slug;
  const title = locale === "en" ? work.titleEn : work.titleZh;
  const description = locale === "en" ? work.descriptionEn : work.descriptionZh;
  const content = locale === "en" ? work.contentEn : work.contentZh;
  const isVideo = work.type === "video";
  const isSoftwareOrTool = work.type === "software" || work.type === "tool";
  const videoEmbed = isVideo ? getVideoEmbedInfo(work.demoLink) : null;
  const hasRelatedLinks = !!(work.articleLink || work.demoLink || work.sourceLink || work.downloadLink);
  const hasContent = !!content?.trim();
  const primary = normalizeHexColor(theme?.primaryColor, "#1f6feb");
  const background = normalizeHexColor(theme?.backgroundColor, "#eef3fb");
  const accentSoft = hexToRgba(primary, 0.18);
  const usedHeadingIds = new Map<string, number>();

  const renderHeading =
    (Tag: "h1" | "h2" | "h3" | "h4") =>
    ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
      const text = getNodeText(children);
      const id = nextHeadingId(text, usedHeadingIds);
      return (
        <Tag id={id} {...props}>
          {children}
        </Tag>
      );
    };

  return (
    <main
      className="mx-auto min-h-screen max-w-[1120px] px-4 pb-8 pt-5 md:px-7 md:pt-8"
      style={{
        background: `radial-gradient(circle at 90% 8%, ${hexToRgba(primary, 0.2)} 0%, ${background} 40%, #f9fbff 68%, #ffffff 100%)`
      }}
    >
      <LanguageSwitcher currentLocale={locale} zhPath={`/work/${zhSlug}`} enPath={`/en/work/${enSlug}`} />

      <div className="fixed left-4 top-16 z-50 md:left-7 md:top-20">
        <BackNavButton fallbackHref={prefix || "/"} label={t(locale, "back")} />
      </div>

      <article
        className="rounded-[28px] bg-white/92 p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:p-9"
        style={{ border: `1px solid ${accentSoft}` }}
      >
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{work.type}</div>
        <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">{title}</h1>
        <div className="mt-2 text-sm text-slate-500">{formatDate(work.publishDate, locale)}</div>

        {videoEmbed ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-black">
            <div className="aspect-video w-full">
              <iframe
                src={videoEmbed.embedUrl}
                title={`${title}-video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-base leading-7 text-slate-700">{description}</p>

        {isSoftwareOrTool && !work.demoLink ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {locale === "zh"
              ? "该条目未配置外部链接，以下展示的是详细说明内容。"
              : "No external link is configured for this item. The detailed content is shown below."}
          </div>
        ) : null}

        <div className="markdown-preview mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 text-sm leading-7 text-slate-700">
          {hasContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                h1: renderHeading("h1"),
                h2: renderHeading("h2"),
                h3: renderHeading("h3"),
                h4: renderHeading("h4"),
                img: ({ src, alt }) => {
                  const normalizedSrc = normalizeMarkdownAssetUrl(src || "");
                  return (
                    // Use a native img for markdown content to support arbitrary URLs.
                    <img src={normalizedSrc} alt={alt || "markdown image"} loading="lazy" />
                  );
                }
              }}
            >
              {content ?? ""}
            </ReactMarkdown>
          ) : (
            <p className="text-slate-500">
              {locale === "zh" ? "暂无正文内容。可在后台作品管理中补充 Markdown 介绍。" : "No detailed content yet. You can add Markdown content in admin."}
            </p>
          )}
        </div>
        {hasContent ? <WorkTocPanel content={content ?? ""} locale={locale} /> : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {toTags(work.tags).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              #{tag}
            </span>
          ))}
        </div>

        {hasRelatedLinks ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{t(locale, "relatedLinks")}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {work.articleLink && (
                <ActionLink href={work.articleLink} primary={primary} label="Article" />
              )}
              {work.demoLink && <ActionLink href={work.demoLink} primary={primary} label="Demo" />}
              {work.sourceLink && <ActionLink href={work.sourceLink} primary={primary} label="GitHub" />}
              {work.downloadLink && <ActionLink href={work.downloadLink} primary={primary} label="Download" />}
            </div>
          </section>
        ) : null}
      </article>

      <div className="mt-5">
        <CommentBoard workId={work.id} locale={locale} />
      </div>
    </main>
  );
}

function ActionLink({ href, label, primary }: { href: string; label: string; primary: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-white transition hover:-translate-y-0.5"
      style={{ backgroundColor: primary }}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function normalizeHexColor(input: string | null | undefined, fallback: string) {
  const value = (input || "").trim();
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value) ? value : fallback;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

function normalizeMarkdownAssetUrl(src: string) {
  const value = src.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("//")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/")) return value;
  if (value.startsWith("./")) return value.slice(1);
  return `/${value}`;
}

function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children);
  return "";
}

function nextHeadingId(text: string, used: Map<string, number>) {
  const base = slugifyHeading(text);
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

function slugifyHeading(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "section";
}
