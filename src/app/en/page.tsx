import type { Metadata } from "next";

import { LandingPage } from "@/components/home/landing-page";
import { getFeaturedWorks, getLatestWorks, getProfile, getVisibleLinks } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: profile?.seoTitleEn || profile?.seoTitle || "tellme.fun | Personal Brand & Portfolio",
    description: profile?.seoDescriptionEn || profile?.seoDescription || "Personal branding page and portfolio manager."
  };
}

export default async function HomePageEn() {
  const [profile, links, featuredWorks, works] = await Promise.all([
    getProfile(),
    getVisibleLinks(),
    getFeaturedWorks(),
    getLatestWorks(24)
  ]);

  return <LandingPage locale="en" profile={profile} links={links} featuredWorks={featuredWorks} works={works} />;
}
