import type { AppLocale } from "@/lib/locale";

type Dict = Record<string, string>;

const zh: Dict = {
  brand: "tellme.fun",
  subtitle: "个人品牌数字名片与作品集",
  featured: "热门作品",
  latest: "最新发布",
  back: "返回",
  relatedLinks: "相关链接",
  moreWorks: "更多作品",
  comments: "留言板",
  admin: "管理后台",
  profile: "个人资料",
  links: "社交链接",
  works: "作品管理",
  analytics: "统计分析",
  subscribers: "邮件订阅"
};

const en: Dict = {
  brand: "tellme.fun",
  subtitle: "Personal Brand Card & Portfolio",
  featured: "Featured Works",
  latest: "Latest",
  back: "Back",
  relatedLinks: "Related Links",
  moreWorks: "More Works",
  comments: "Comments",
  admin: "Admin",
  profile: "Profile",
  links: "Social Links",
  works: "Works",
  analytics: "Analytics",
  subscribers: "Newsletter"
};

export function t(locale: AppLocale, key: keyof typeof zh) {
  return (locale === "en" ? en : zh)[key];
}
