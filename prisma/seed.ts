import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@tellme.fun";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";

  await prisma.profile.upsert({
    where: { id: "default-profile" },
    update: {},
    create: {
      id: "default-profile",
      nameZh: "张三",
      titleZh: "独立开发者 / 创作者",
      bioZh: "一个热爱技术与内容创作的独立开发者，专注 AI、效率工具和数字产品。",
      nameEn: "Zhang San",
      titleEn: "Indie Developer / Creator",
      bioEn: "An indie developer focusing on AI, productivity tools, and digital products.",
      avatar: "/avatar-placeholder.svg",
      location: "Shanghai",
      seoTitle: "tellme.fun - 个人品牌数字名片",
      seoDescription: "个人品牌展示、作品管理、社交链接聚合"
    }
  });

  const links = [
    { platform: "github", label: "GitHub", url: "https://github.com/", sortOrder: 1 },
    { platform: "twitter", label: "X / Twitter", url: "https://x.com/", sortOrder: 2 },
    { platform: "email", label: "Email", url: "mailto:admin@tellme.fun", sortOrder: 3 }
  ] as const;

  for (const link of links) {
    await prisma.socialLink.upsert({
      where: { id: `${link.platform}-seed` },
      update: link,
      create: { id: `${link.platform}-seed`, ...link }
    });
  }

  await prisma.work.upsert({
    where: { slug: "ai-practice-notes" },
    update: {},
    create: {
      slug: "ai-practice-notes",
      slugZh: "ai-shi-zhan-bi-ji",
      slugEn: "ai-practice-notes",
      type: "article",
      titleZh: "我的 AI 实战笔记",
      titleEn: "My AI Practice Notes",
      descriptionZh: "从 0 到 1 的 AI 产品落地经验总结。",
      descriptionEn: "A practical guide for shipping AI products from 0 to 1.",
      contentZh: "# 我的 AI 实战笔记\n\n这里是中文内容。",
      contentEn: "# My AI Practice Notes\n\nThis is English content.",
      tags: "AI,Next.js,Prisma",
      category: "AI",
      featured: true,
      publishDate: new Date()
    }
  });

  const passwordHash = await hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
