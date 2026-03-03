import type { Metadata } from "next";
import "@/styles/globals.css";
import { getProfile } from "@/lib/content";
import { PageTracker } from "@/components/common/page-tracker";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const isEnDefault = profile?.defaultLocale === "en";
  const title = (isEnDefault ? profile?.seoTitleEn : profile?.seoTitleZh)?.trim() || profile?.seoTitle?.trim() || "tellme.fun";
  const description =
    (isEnDefault ? profile?.seoDescriptionEn : profile?.seoDescriptionZh)?.trim() ||
    profile?.seoDescription?.trim() ||
    "Personal branding page and portfolio manager";
  const favicon = profile?.favicon?.trim() || "/favicon.ico";

  return {
    title,
    description,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
