export type AppLocale = "zh" | "en";

export const DEFAULT_LOCALE: AppLocale = "zh";

export function normalizeLocale(locale?: string): AppLocale {
  return locale === "en" ? "en" : "zh";
}

export function isEnglishPath(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}
