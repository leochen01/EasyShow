"use client";

import { ListTree, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { AppLocale } from "@/lib/locale";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function WorkTocPanel({ content, locale }: { content: string; locale: AppLocale }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const items = useMemo(() => extractMarkdownHeadings(content).filter((item) => item.level <= 3), [content]);

  useEffect(() => {
    if (!open || !mounted) return;
    setClosing(false);
  }, [mounted, open]);

  if (items.length === 0) return null;

  function togglePanel() {
    if (!open) {
      setMounted(true);
      setOpen(true);
      return;
    }
    setClosing(true);
    setOpen(false);
    window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 180);
  }

  return (
    <>
      <button
        type="button"
        onClick={togglePanel}
        className={`fixed right-3 top-16 z-40 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.15)] backdrop-blur transition-all duration-200 hover:bg-white md:right-5 md:top-20 ${
          open ? "scale-[1.02] border-slate-300 shadow-[0_14px_30px_rgba(15,23,42,0.22)]" : ""
        }`}
        aria-label={locale === "zh" ? "切换目录" : "Toggle table of contents"}
      >
        {open ? <X className="h-4 w-4" /> : <ListTree className="h-4 w-4" />}
        {locale === "zh" ? "目录" : "TOC"}
      </button>

      {mounted ? (
        <aside
          className={`fixed right-3 top-[6.1rem] z-40 w-[280px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_20px_48px_rgba(15,23,42,0.15)] backdrop-blur transition-all duration-200 md:right-5 md:top-[7.2rem] ${
            open && !closing
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="mb-2 text-sm font-semibold text-slate-800">{locale === "zh" ? "文章目录" : "Table of Contents"}</div>
          <nav className="max-h-[60vh] overflow-auto pr-1">
            <ul className="space-y-1.5">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block truncate rounded px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${
                      item.level === 1 ? "font-semibold" : item.level === 3 ? "pl-5 text-xs" : "pl-3"
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      const target = document.getElementById(item.id);
                      if (!target) return;
                      target.scrollIntoView({ behavior: "smooth", block: "start" });
                      window.history.replaceState(null, "", `#${item.id}`);
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}
    </>
  );
}

function extractMarkdownHeadings(markdown: string): TocItem[] {
  const lines = markdown.split(/\r?\n/);
  const items: TocItem[] = [];
  const used = new Map<string, number>();
  let fenced = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;

    const match = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim();
    if (!text) continue;

    const base = toSlug(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    items.push({ id, text, level });
  }

  return items;
}

function toSlug(value: string) {
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
