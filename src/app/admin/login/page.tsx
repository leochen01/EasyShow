import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=credentials");
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (session?.user?.email && (!adminEmail || session.user.email.toLowerCase() === adminEmail)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">管理员登录</h2>
      <p className="mt-2 text-sm text-slate-500">使用管理员邮箱和密码登录后台。</p>

      <form action={loginAction} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-500">邮箱</span>
          <input name="email" type="email" required className="rounded border border-slate-300 px-3 py-2" />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-500">密码</span>
          <input name="password" type="password" required className="rounded border border-slate-300 px-3 py-2" />
        </label>

        {searchParams?.error ? <p className="text-sm text-rose-600">登录失败，请检查邮箱或密码。</p> : null}

        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
          登录
        </button>
      </form>

      <Link href="/" className="mt-4 inline-block text-sm text-blue-600">
        返回首页
      </Link>
    </div>
  );
}
