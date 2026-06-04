import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const sqlitePath = process.env.SQLITE_SOURCE ?? "prisma/dev.db";
const prisma = new PrismaClient();

const profileFields = [
  "id",
  "nameZh",
  "titleZh",
  "bioZh",
  "nameEn",
  "titleEn",
  "bioEn",
  "landingKickerZh",
  "landingKickerEn",
  "landingHeadlineZh",
  "landingHeadlineEn",
  "landingSublineZh",
  "landingSublineEn",
  "landingCtaSecondaryZh",
  "landingCtaSecondaryEn",
  "landingCtaSecondaryUrlZh",
  "landingCtaSecondaryUrlEn",
  "locationZh",
  "locationEn",
  "defaultLocale",
  "avatar",
  "favicon",
  "location",
  "primaryColor",
  "backgroundColor",
  "font",
  "seoTitle",
  "seoDescription",
  "seoTitleZh",
  "seoTitleEn",
  "seoDescriptionZh",
  "seoDescriptionEn",
  "worksPageSize",
  "createdAt",
  "updatedAt"
];

const socialLinkFields = ["id", "platform", "label", "url", "icon", "visible", "sortOrder", "createdAt", "updatedAt"];

const workFields = [
  "id",
  "type",
  "titleZh",
  "descriptionZh",
  "contentZh",
  "titleEn",
  "descriptionEn",
  "contentEn",
  "slugZh",
  "slugEn",
  "slug",
  "coverImage",
  "tags",
  "category",
  "demoLink",
  "sourceLink",
  "downloadLink",
  "articleLink",
  "publishDate",
  "visible",
  "featured",
  "views",
  "createdAt",
  "updatedAt"
];

async function main() {
  const [profiles, socialLinks, works] = ["Profile", "SocialLink", "Work"].map((table) => readTable(table));

  for (const profile of profiles.map((row) => normalizeRow(row, profileFields))) {
    await prisma.profile.upsert({
      where: { id: profile.id },
      update: profile,
      create: profile
    });
  }

  for (const link of socialLinks.map((row) => normalizeRow(row, socialLinkFields))) {
    await prisma.socialLink.upsert({
      where: { id: link.id },
      update: link,
      create: link
    });
  }

  for (const work of works.map((row) => normalizeRow(row, workFields))) {
    await prisma.work.upsert({
      where: { id: work.id },
      update: work,
      create: work
    });
  }

  console.log(`Imported ${profiles.length} profiles, ${socialLinks.length} social links, and ${works.length} works.`);
}

function readTable(table) {
  const output = execFileSync("sqlite3", ["-json", sqlitePath, `select * from ${table};`], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 50
  });

  return JSON.parse(output || "[]");
}

function normalizeRow(row, fields) {
  const normalized = {};

  for (const field of fields) {
    if (!(field in row)) continue;
    normalized[field] = normalizeValue(field, row[field]);
  }

  return normalized;
}

function normalizeValue(field, value) {
  if (value === null || value === undefined) return null;
  if (["createdAt", "updatedAt", "publishDate", "timestamp", "subscribedAt", "sentAt", "openedAt", "clickedAt", "lastEmailAt"].includes(field)) {
    return new Date(value);
  }
  if (["visible", "featured"].includes(field)) {
    return Boolean(value);
  }
  if (["sortOrder", "views", "worksPageSize"].includes(field)) {
    return Number(value);
  }
  return value;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
