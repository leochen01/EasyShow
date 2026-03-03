import type { Metadata } from "next";

import { LandingPage } from "@/components/home/landing-page";
import { getFeaturedWorks, getLatestWorks, getProfile, getVisibleLinks } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const fallbackTitle = "tellme.fun | 个人品牌与作品集";
  const fallbackDescription = "个人品牌展示页与作品集管理平台。";
  const title = profile?.seoTitleZh || profile?.seoTitle;
  const description = profile?.seoDescriptionZh || profile?.seoDescription;

  return {
    title: title || fallbackTitle,
    description: description || fallbackDescription
  };
}

export default async function HomePage() {
  const [profile, links, featuredWorks, works] = await Promise.all([
    getProfile(),
    getVisibleLinks(),
    getFeaturedWorks(),
    getLatestWorks(24)
  ]);

  return <LandingPage locale="zh" profile={profile} links={links} featuredWorks={featuredWorks} works={works} />;
}
