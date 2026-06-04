import { notFound } from "next/navigation";

import { WorkDetail } from "@/components/works/work-detail";
import { getProfile, getWorkBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

type WorkPageProps = {
  params: { slug: string };
};

export default async function WorkPageEn({ params }: WorkPageProps) {
  const [work, profile] = await Promise.all([getWorkBySlug(params.slug), getProfile()]);
  if (!work) return notFound();

  return (
    <WorkDetail
      locale="en"
      work={work}
      theme={{ primaryColor: profile?.primaryColor, backgroundColor: profile?.backgroundColor }}
    />
  );
}
