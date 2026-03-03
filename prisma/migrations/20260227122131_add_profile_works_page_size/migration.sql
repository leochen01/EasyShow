-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameZh" TEXT NOT NULL,
    "titleZh" TEXT,
    "bioZh" TEXT,
    "nameEn" TEXT NOT NULL,
    "titleEn" TEXT,
    "bioEn" TEXT,
    "landingKickerZh" TEXT,
    "landingKickerEn" TEXT,
    "landingHeadlineZh" TEXT,
    "landingHeadlineEn" TEXT,
    "landingSublineZh" TEXT,
    "landingSublineEn" TEXT,
    "landingCtaSecondaryZh" TEXT,
    "landingCtaSecondaryEn" TEXT,
    "landingCtaSecondaryUrlZh" TEXT,
    "landingCtaSecondaryUrlEn" TEXT,
    "locationZh" TEXT,
    "locationEn" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'zh',
    "avatar" TEXT,
    "favicon" TEXT,
    "location" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0f172a',
    "backgroundColor" TEXT NOT NULL DEFAULT '#f8fafc',
    "font" TEXT NOT NULL DEFAULT 'default',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoTitleZh" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "worksPageSize" INTEGER NOT NULL DEFAULT 8,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Profile" ("avatar", "backgroundColor", "bioEn", "bioZh", "createdAt", "defaultLocale", "favicon", "font", "id", "landingCtaSecondaryEn", "landingCtaSecondaryUrlEn", "landingCtaSecondaryUrlZh", "landingCtaSecondaryZh", "landingHeadlineEn", "landingHeadlineZh", "landingKickerEn", "landingKickerZh", "landingSublineEn", "landingSublineZh", "location", "locationEn", "locationZh", "nameEn", "nameZh", "primaryColor", "seoDescription", "seoDescriptionEn", "seoDescriptionZh", "seoTitle", "seoTitleEn", "seoTitleZh", "titleEn", "titleZh", "updatedAt") SELECT "avatar", "backgroundColor", "bioEn", "bioZh", "createdAt", "defaultLocale", "favicon", "font", "id", "landingCtaSecondaryEn", "landingCtaSecondaryUrlEn", "landingCtaSecondaryUrlZh", "landingCtaSecondaryZh", "landingHeadlineEn", "landingHeadlineZh", "landingKickerEn", "landingKickerZh", "landingSublineEn", "landingSublineZh", "location", "locationEn", "locationZh", "nameEn", "nameZh", "primaryColor", "seoDescription", "seoDescriptionEn", "seoDescriptionZh", "seoTitle", "seoTitleEn", "seoTitleZh", "titleEn", "titleZh", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
