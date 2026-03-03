import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyTurnstileToken } from "@/lib/captcha";
import { prisma } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/request";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const createCommentSchema = z.object({
  workId: z.string().cuid().optional().nullable(),
  author: z.string().min(1).max(40).optional(),
  email: z.string().email().max(120),
  content: z.string().min(1).max(1000),
  parentId: z.string().cuid().optional().nullable(),
  captchaToken: z.string().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workId = searchParams.get("workId");
  const comments = await prisma.comment.findMany({
    where: {
      status: "approved",
      ...(workId ? { workId } : { workId: null })
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);
  const userAgent = request.headers.get("user-agent");

  // 1) 频率限制：同 IP 5 分钟 1 条
  if (ipHash) {
    const lastComment = await prisma.comment.findFirst({
      where: { ipHash },
      orderBy: { createdAt: "desc" }
    });

    if (lastComment) {
      const diff = Date.now() - lastComment.createdAt.getTime();
      if (diff < RATE_LIMIT_WINDOW_MS) {
        const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - diff) / 1000);
        return NextResponse.json(
          { message: "Too many requests", retryAfterSec },
          {
            status: 429,
            headers: { "Retry-After": String(retryAfterSec) }
          }
        );
      }
    }
  }

  // 2) 验证码：配置 TURNSTILE_SECRET_KEY 后强制校验
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!body.captchaToken) {
      return NextResponse.json({ message: "Captcha required" }, { status: 400 });
    }

    const captcha = await verifyTurnstileToken(body.captchaToken, clientIp);
    if (!captcha.ok) {
      return NextResponse.json({ message: "Captcha verify failed", errors: captcha.errors }, { status: 400 });
    }
  }

  const created = await prisma.comment.create({
    data: {
      workId: body.workId,
      author: body.author || deriveAuthorFromEmail(body.email) || "游客",
      email: body.email,
      content: body.content,
      parentId: body.parentId,
      status: "pending",
      ipHash,
      userAgent
    }
  });

  return NextResponse.json(created, { status: 201 });
}

function deriveAuthorFromEmail(email: string) {
  const prefix = email.split("@")[0]?.trim();
  return prefix || null;
}
