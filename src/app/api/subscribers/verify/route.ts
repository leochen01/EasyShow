import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  buildPublicUrl,
  buildTrackClickUrl,
  buildTrackOpenUrl,
  renderResultHtml,
  sendWelcomeEmail
} from "@/lib/newsletter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(renderResultHtml("验证失败", "缺少验证参数。"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { verifyToken: token } });

  if (!subscriber) {
    return new NextResponse(renderResultHtml("验证失败", "验证链接无效或已过期。"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  if (subscriber.status !== "active") {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "active",
        verifyToken: crypto.randomUUID()
      }
    });
  }

  const subject = "欢迎订阅 tellme.fun";
  const emailLog = await prisma.emailLog.create({
    data: {
      subscriberId: subscriber.id,
      subject,
      type: "welcome"
    }
  });

  const unsubscribeRaw = buildPublicUrl(request.url, `/api/subscribers/unsubscribe?token=${subscriber.unsubscribeToken}`);
  const unsubscribeUrl = buildTrackClickUrl(request.url, emailLog.id, unsubscribeRaw);
  const trackingPixelUrl = buildTrackOpenUrl(request.url, emailLog.id);

  const sent = await sendWelcomeEmail({
    to: subscriber.email,
    unsubscribeUrl,
    trackingPixelUrl
  });

  if (sent.ok) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { lastEmailAt: new Date() }
    });
  } else {
    await prisma.emailLog.delete({ where: { id: emailLog.id } });
  }

  return new NextResponse(renderResultHtml("订阅成功", "邮箱已验证成功，欢迎邮件已发送。"), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
