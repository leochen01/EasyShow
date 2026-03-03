"use client";

import Script from "next/script";
import { MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type CommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function CommentBoard({ workId, locale = "zh" }: { workId?: string; locale?: "zh" | "en" }) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const query = useMemo(() => (workId ? `?workId=${workId}` : ""), [workId]);
  const copy =
    locale === "en"
      ? {
          title: "Guestbook",
          empty: "No public comments yet",
          emailPlaceholder: "Email (private, only visible to admin)",
          contentPlaceholder: "Your comment",
          noCaptcha: "Turnstile not configured. Captcha is currently disabled.",
          submitting: "Submitting...",
          submit: "Submit",
          tooFast: (sec: number) => `Too many requests. Please retry in ${sec}s.`,
          failed: "Submit failed",
          success: "Comment submitted. It will appear after approval."
        }
      : {
          title: "留言板",
          empty: "暂无公开留言",
          emailPlaceholder: "邮箱（仅管理员可见）",
          contentPlaceholder: "留言内容",
          noCaptcha: "未配置 Turnstile，当前为无验证码模式。",
          submitting: "提交中...",
          submit: "提交留言",
          tooFast: (sec: number) => `提交过快，请 ${sec} 秒后重试。`,
          failed: "提交失败",
          success: "留言已提交，待审核后展示。"
        };

  useEffect(() => {
    async function loadComments() {
      const response = await fetch(`/api/comments${query}`, { cache: "no-store" });
      if (!response.ok) return;
      const list = (await response.json()) as Array<{
        id: string;
        author: string;
        content: string;
        createdAt: string;
      }>;
      setItems(list);
    }

    void loadComments();
  }, [query]);

  function renderTurnstile() {
    if (!siteKey) return;
    if (!containerRef.current) return;
    if (!window.turnstile) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        setCaptchaToken(token);
      }
    });
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workId,
        email,
        content,
        captchaToken: captchaToken || undefined
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string; retryAfterSec?: number };

    if (!response.ok) {
      if (response.status === 429 && payload.retryAfterSec) {
        setMessage(copy.tooFast(payload.retryAfterSec));
      } else {
        setMessage(locale === "zh" ? (payload.message ?? copy.failed) : copy.failed);
      }
      setSubmitting(false);
      return;
    }

    setMessage(copy.success);
    setContent("");
    setCaptchaToken("");
    setSubmitting(false);

    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  return (
    <section className="rounded-[26px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
      {siteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onLoad={renderTurnstile} /> : null}

      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        <MessageSquareText className="h-3.5 w-3.5" />
        {copy.title}
      </div>

      <div className="mt-4 grid gap-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">{copy.empty}</p> : null}
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{item.author}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{item.content}</p>
          </div>
        ))}
      </div>

      <form className="mt-5 grid gap-3" onSubmit={submitComment}>
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
          placeholder={copy.emailPlaceholder}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          className="min-h-24 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
          placeholder={copy.contentPlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          required
        />

        {siteKey ? <div ref={containerRef} /> : <p className="text-xs text-amber-600">{copy.noCaptcha}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? copy.submitting : copy.submit}
          </button>
          <span className="text-sm text-slate-500">{message}</span>
        </div>
      </form>
    </section>
  );
}
