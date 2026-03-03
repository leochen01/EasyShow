import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/admin/profile-form";
import { requireAdminPage } from "@/lib/permissions";

export default async function AdminProfilePage() {
  await requireAdminPage();
  const profile = await prisma.profile.findFirst({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h2 className="text-2xl font-semibold">个人资料（双语）</h2>
      <ProfileForm initial={profile} />
    </div>
  );
}
