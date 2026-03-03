import { notFound } from "next/navigation";

import { WorkDetail } from "@/components/works/work-detail";
import { getProfile, getVisibleWorkSlugs, getWorkBySlug } from "@/lib/content";

type WorkPageProps = {
  params: { slug: string };
};

export default async function WorkPage({ params }: WorkPageProps) {
  const [work, profile] = await Promise.all([getWorkBySlug(params.slug), getProfile()]);
  if (!work) return notFound();

  return (
    <WorkDetail
      locale="zh"
      work={work}
      theme={{ primaryColor: profile?.primaryColor, backgroundColor: profile?.backgroundColor }}
    />
  );
}

export async function generateStaticParams() {
  return getVisibleWorkSlugs();
}
