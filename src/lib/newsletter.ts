import { Resend } from "resend";

const APP_NAME = "tellme.fun";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "tellme.fun <no-reply@tellme.fun>";
}

export async function sendVerifySubscriptionEmail({
  to,
  verifyUrl,
  unsubscribeUrl,
  trackingPixelUrl
}: {
  to: string;
  verifyUrl: string;
  unsubscribeUrl: string;
  trackingPixelUrl?: string;
}) {
  const client = getResend();
  if (!client) {
    return { ok: false as const, reason: "RESEND_API_KEY is missing" };
  }

  const subject = `请确认订阅 ${APP_NAME}`;
  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <h2>确认订阅 ${APP_NAME}</h2>
    <p>点击下方按钮完成订阅确认：</p>
    <p><a href="${verifyUrl}" style="background:#0f172a;color:#fff;padding:10px 14px;text-decoration:none;border-radius:8px;display:inline-block;">确认订阅</a></p>
    <p>如果按钮不可用，请打开链接：<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p style="font-size:12px;color:#475569;">不想再收到邮件？<a href="${unsubscribeUrl}">一键退订</a></p>
    ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:block;opacity:0;" />` : ""}
  </div>`;

  await client.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html
  });

  return { ok: true as const, subject };
}

export async function sendWelcomeEmail({
  to,
  unsubscribeUrl,
  trackingPixelUrl
}: {
  to: string;
  unsubscribeUrl: string;
  trackingPixelUrl?: string;
}) {
  const client = getResend();
  if (!client) {
    return { ok: false as const, reason: "RESEND_API_KEY is missing" };
  }

  const subject = `欢迎订阅 ${APP_NAME}`;
  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <h2>欢迎加入 ${APP_NAME}</h2>
    <p>你已成功订阅，后续有新文章/新作品会通过邮件通知你。</p>
    <p style="font-size:12px;color:#475569;">你可以随时<a href="${unsubscribeUrl}">一键退订</a>。</p>
    ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:block;opacity:0;" />` : ""}
  </div>`;

  await client.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html
  });

  return { ok: true as const, subject };
}

export function buildPublicUrl(requestUrl: string, path: string) {
  const preferred = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  const base = preferred ? new URL(preferred) : new URL(requestUrl);
  return new URL(path, base).toString();
}

export function buildTrackOpenUrl(requestUrl: string, emailLogId: string) {
  return buildPublicUrl(requestUrl, `/api/newsletter/open/${emailLogId}`);
}

export function buildTrackClickUrl(requestUrl: string, emailLogId: string, targetUrl: string) {
  const base = buildPublicUrl(requestUrl, "/api/newsletter/click");
  const url = new URL(base);
  url.searchParams.set("log", emailLogId);
  url.searchParams.set("url", targetUrl);
  return url.toString();
}

export function renderResultHtml(title: string, message: string) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;background:#fff;padding:24px;border-radius:14px;border:1px solid #e2e8f0;">
      <h1 style="margin-top:0;">${title}</h1>
      <p>${message}</p>
      <p><a href="/" style="color:#1d4ed8;">返回首页</a></p>
    </div>
  </body>
</html>`;
}
