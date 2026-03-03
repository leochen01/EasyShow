"use client";

import { useState } from "react";

export function NewsletterForm({
  source,
  compact,
  locale = "zh"
}: {
  source: string;
  compact?: boolean;
  locale?: "zh" | "en";
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const copy =
    locale === "en"
      ? {
          intro: "New articles and projects will be delivered to your inbox first.",
          submit: "Subscribe",
          submitting: "Submitting...",
          quickSubmitting: "...",
          submitFailed: "Subscription failed. Please try again later.",
          verifySent: "Please check your email and click the confirmation link.",
          verifyFailed: "Subscription created, but verification email failed to send. Please contact the admin."
        }
      : {
          intro: "新文章和作品更新将第一时间发送到你的邮箱。",
          submit: "订阅",
          submitting: "提交中...",
          quickSubmitting: "...",
          submitFailed: "订阅失败，请稍后重试。",
          verifySent: "订阅申请已提交，请到邮箱点击确认链接。",
          verifyFailed: "订阅已创建，但验证邮件发送失败，请联系管理员检查 Resend 配置。"
        };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source })
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string; emailSent?: boolean };

    if (!response.ok) {
      setSubmitting(false);
      setMessage(locale === "zh" ? (payload.message ?? copy.submitFailed) : copy.submitFailed);
      return;
    }

    setSubmitting(false);
    setEmail("");

    if (payload.emailSent) {
      setMessage(copy.verifySent);
    } else {
      setMessage(copy.verifyFailed);
    }
  }

  if (compact) {
    return (
      <form className="grid gap-2" onSubmit={onSubmit}>
        <p className="text-xs text-slate-600">{copy.intro}</p>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? copy.quickSubmitting : copy.submit}
          </button>
        </div>
        <div className="text-xs text-slate-500">{message}</div>
      </form>
    );
  }

  return (
    <section className="rounded-[26px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <p className="text-sm leading-6 text-slate-600">{copy.intro}</p>

      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? copy.submitting : copy.submit}
          </button>
        </div>
        <div className="text-sm text-slate-500">{message}</div>
      </form>
    </section>
  );
}
