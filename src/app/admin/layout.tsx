import Link from "next/link";
import { signOut } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/profile", label: "个人资料" },
  { href: "/admin/links", label: "社交链接" },
  { href: "/admin/works", label: "作品管理" },
  { href: "/admin/comments", label: "留言管理" },
  { href: "/admin/subscribers", label: "邮件订阅" },
  { href: "/admin/analytics", label: "统计分析" }
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl bg-white p-4 shadow-sm">
          <h1 className="text-lg font-semibold">TellMe.fun Admin</h1>
          <nav className="mt-4 grid gap-1 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex justify-end">
            <form action={logoutAction}>
              <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">登出</button>
            </form>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
