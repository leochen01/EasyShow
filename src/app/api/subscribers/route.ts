import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import {
  buildPublicUrl,
  buildTrackClickUrl,
  buildTrackOpenUrl,
  sendVerifySubscriptionEmail
} from "@/lib/newsletter";
import { requireAdminApi } from "@/lib/permissions";

const subscribeSchema = z.object({
  email: z.string().email().max(120),
  name: z.string().max(80).optional().nullable(),
  source: z.string().max(80).optional().nullable()
});

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const subscribers = await prisma.subscriber.findMany({ orderBy: { subscribedAt: "desc" }, take: 100 });
  return NextResponse.json(subscribers);
}

export async function POST(request: Request) {
  const parsed = subscribeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  const body = parsed.data;
  const email = body.email.trim().toLowerCase();

  const subscriber = await prisma.subscriber.upsert({
    where: { email },
    update: {
      status: "pending",
      verifyToken: crypto.randomUUID(),
      unsubscribeToken: crypto.randomUUID(),
      name: body.name,
      subscribeSource: body.source ?? "homepage"
    },
    create: {
      email,
      name: body.name,
      status: "pending",
      verifyToken: crypto.randomUUID(),
      unsubscribeToken: crypto.randomUUID(),
      subscribeSource: body.source ?? "homepage"
    }
  });

  const subject = "请确认订阅 tellme.fun";
  const emailLog = await prisma.emailLog.create({
    data: {
      subscriberId: subscriber.id,
      subject,
      type: "verify"
    }
  });

  const verifyUrlRaw = buildPublicUrl(request.url, `/api/subscribers/verify?token=${subscriber.verifyToken}`);
  const unsubscribeUrlRaw = buildPublicUrl(request.url, `/api/subscribers/unsubscribe?token=${subscriber.unsubscribeToken}`);
  const verifyUrl = buildTrackClickUrl(request.url, emailLog.id, verifyUrlRaw);
  const unsubscribeUrl = buildTrackClickUrl(request.url, emailLog.id, unsubscribeUrlRaw);
  const trackingPixelUrl = buildTrackOpenUrl(request.url, emailLog.id);

  const sent = await sendVerifySubscriptionEmail({
    to: subscriber.email,
    verifyUrl,
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

  return NextResponse.json(
    {
      id: subscriber.id,
      status: subscriber.status,
      emailSent: sent.ok,
      message: sent.ok ? "Verification email sent" : sent.reason
    },
    { status: 201 }
  );
}
