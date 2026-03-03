import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { renderResultHtml } from "@/lib/newsletter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(renderResultHtml("退订失败", "缺少退订参数。"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });

  if (!subscriber) {
    return new NextResponse(renderResultHtml("退订失败", "退订链接无效或已过期。"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  if (subscriber.status !== "unsubscribed") {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: "unsubscribed" }
    });
  }

  return new NextResponse(renderResultHtml("已退订", "你已成功退订邮件通知。"), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
