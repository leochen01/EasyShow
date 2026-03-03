import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return true;
  return email.toLowerCase() === adminEmail;
}

export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminApi() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    };
  }

  if (!isAdminEmail(session.user.email)) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 })
    };
  }

  return { ok: true as const, session };
}
