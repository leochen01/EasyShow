import {
  ArrowRight,
  Compass,
  Github,
  Globe,
  Mail,
  MessageCircle,
  MonitorPlay,
  Sparkles,
  Twitter,
  Youtube
} from "lucide-react";

import { formatDate } from "@/lib/utils";
import type { AppLocale } from "@/lib/locale";
import { t } from "@/lib/messages";
import { CommentBoard } from "@/components/works/comment-board";
import { NewsletterForm } from "@/components/common/newsletter-form";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { WorkTabs } from "@/components/home/work-tabs";

type LandingProps = {
  locale: AppLocale;
  profile: {
    nameZh: string;
    titleZh: string | null;
    bioZh: string | null;
    nameEn: string;
    titleEn: string | null;
    bioEn: string | null;
    landingKickerZh: string | null;
    landingKickerEn: string | null;
    landingHeadlineZh: string | null;
    landingHeadlineEn: string | null;
    landingSublineZh: string | null;
    landingSublineEn: string | null;
    landingCtaSecondaryZh: string | null;
    landingCtaSecondaryEn: string | null;
    landingCtaSecondaryUrlZh: string | null;
    landingCtaSecondaryUrlEn: string | null;
    locationZh: string | null;
    locationEn: string | null;
    location: string | null;
    avatar: string | null;
    primaryColor: string;
    backgroundColor: string;
    worksPageSize: number | null;
  } | null;
  links: Array<{ id: string; label: string; url: string }>;
  featuredWorks: Array<{
    id: string;
    slug: string;
    titleZh: string;
    titleEn: string;
    descriptionZh: string | null;
    descriptionEn: string | null;
    type: string;
    coverImage: string | null;
    demoLink: string | null;
    category: string | null;
    publishDate: Date;
    tags: string;
  }>;
  works: Array<{
    id: string;
    slug: string;
    titleZh: string;
    titleEn: string;
    descriptionZh: string | null;
    descriptionEn: string | null;
    type: "article" | "video" | "software" | "tool";
    coverImage: string | null;
    demoLink: string | null;
    category: string | null;
    publishDate: Date;
  }>;
};

export function LandingPage({ locale, profile, links, featuredWorks, works }: LandingProps) {
  const name = locale === "en" ? profile?.nameEn : profile?.nameZh;
  const title = locale === "en" ? profile?.titleEn : profile?.titleZh;
  const bio = locale === "en" ? profile?.bioEn : profile?.bioZh;
  const location = locale === "en" ? (profile?.locationEn || profile?.locationZh || profile?.location) : (profile?.locationZh || profile?.locationEn || profile?.location);
  const prefix = locale === "en" ? "/en" : "";
  const primary = normalizeHexColor(profile?.primaryColor, "#1f6feb");
  const background = normalizeHexColor(profile?.backgroundColor, "#eef3fb");
  const surfaceGlow = hexToRgba(primary, 0.2);
  const accentSoft = hexToRgba(primary, 0.18);

  const copies =
    locale === "zh"
      ? {
          kicker: profile?.landingKickerZh || "个人品牌展示",
          headline: profile?.landingHeadlineZh || "把你的创作能力，转化成可被看见的机会",
          subline: profile?.landingSublineZh || "聚合文章、视频、软件与工具，让访客一眼理解你是谁、做过什么、值不值得合作。",
          locationFallback: "全球远程",
          ctaPrimary: "浏览作品",
          ctaSecondary: profile?.landingCtaSecondaryZh || "联系我",
          socialTitle: "社交与联系",
          worksLabel: "作品",
          featuredLabel: "精选",
          linksLabel: "链接",
          commentTitle: "访客留言"
        }
      : {
          kicker: profile?.landingKickerEn || "Personal Branding",
          headline: profile?.landingHeadlineEn || "Turn your work into opportunities people can trust",
          subline: profile?.landingSublineEn || "Showcase articles, videos, software, and tools in one place so visitors understand your value fast.",
          locationFallback: "Remote",
          ctaPrimary: "Explore Works",
          ctaSecondary: profile?.landingCtaSecondaryEn || "Contact",
          socialTitle: "Social & Contact",
          worksLabel: "Works",
          featuredLabel: "Featured",
          linksLabel: "Links",
          commentTitle: "Visitor Wall"
        };

  const fallbackContact = links[0]?.url;
  const ctaSecondaryUrl = locale === "en" ? profile?.landingCtaSecondaryUrlEn : profile?.landingCtaSecondaryUrlZh;
  const primaryContact = ctaSecondaryUrl || fallbackContact;

  return (
    <main
      className="relative mx-auto min-h-screen max-w-[1280px] px-4 pb-8 pt-5 md:px-7 md:pt-8"
      style={{
        background: `radial-gradient(circle at 6% 8%, ${surfaceGlow} 0%, ${background} 36%, #f9fbff 68%, #ffffff 100%)`
      }}
    >
      <LanguageSwitcher currentLocale={locale} zhPath="/" enPath="/en" />
      <div className="hero-orb pointer-events-none" style={{ background: `linear-gradient(135deg, ${hexToRgba(primary, 0.28)}, transparent)` }} />

      <section
        className="glass-panel fade-up relative overflow-hidden rounded-[30px] p-6 md:p-8"
        style={{ borderColor: accentSoft }}
      >
        <div className="hero-grid">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
              <Sparkles className="h-3.5 w-3.5" />
              {copies.kicker}
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">{copies.headline}</h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-700 md:text-lg">{copies.subline}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#works-zone" className="cta-primary" style={{ backgroundColor: primary }}>
                {copies.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={primaryContact || "#"}
                className="cta-secondary"
                style={{ borderColor: hexToRgba(primary, 0.3) }}
                target={primaryContact ? "_blank" : undefined}
                rel={primaryContact ? "noreferrer" : undefined}
              >
                <Compass className="h-4 w-4" />
                {copies.ctaSecondary}
              </a>
            </div>

          </div>

          <div className="grid gap-3">
            <div id="profile-card" className="profile-card">
              <div className="flex items-start gap-4">
                <div className="avatar-ring">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={name || "avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-slate-500">{(name || "U").slice(0, 1)}</div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t(locale, "brand")}</div>
                  <h2 className="truncate text-2xl font-semibold text-slate-900 md:text-3xl">{name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{title}</p>
                  <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {location || copies.locationFallback}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">{bio}</p>

              <div className="metric-grid mt-4">
                <Metric label={copies.worksLabel} value={works.length} />
                <Metric label={copies.featuredLabel} value={featuredWorks.length} />
                <Metric label={copies.linksLabel} value={links.length} />
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{copies.socialTitle}</div>
                <div className="flex flex-wrap gap-2.5">
                  {links.map((link, idx) => {
                    const Icon = getSocialIcon(link.label, link.url);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        className="social-chip"
                        style={{ animationDelay: `${Math.min(idx, 7) * 70}ms` }}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            <NewsletterForm source="homepage" locale={locale} />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4">
        <section
          id="works-zone"
          className="fade-up rounded-[28px] bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] ring-1 ring-white/70 md:p-6"
          style={{ border: `1px solid ${hexToRgba(primary, 0.14)}` }}
        >
          <WorkTabs
            embedded
            locale={locale}
            prefix={prefix}
            primaryColor={primary}
            pageSize={profile?.worksPageSize ?? 8}
            featuredWorks={featuredWorks.map((work) => ({
              ...work,
              publishDate: formatDate(work.publishDate, locale),
              tags: work.tags.split(",").map((x) => x.trim()).filter(Boolean)
            }))}
            works={works.map((work) => ({
              ...work,
              publishDate: formatDate(work.publishDate, locale)
            }))}
          />
        </section>

        <section className="fade-up" style={{ animationDelay: "120ms" }}>
          <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{copies.commentTitle}</div>
          <CommentBoard locale={locale} />
        </section>
      </div>

      <footer className="pb-4 pt-8 text-center text-xs text-slate-500">© 2026 tellme.fun</footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-item">
      <div className="text-xl font-semibold text-slate-900">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function normalizeHexColor(input: string | null | undefined, fallback: string) {
  const value = (input || "").trim();
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value) ? value : fallback;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getSocialIcon(label: string, url: string) {
  const text = `${label} ${url}`.toLowerCase();

  if (text.includes("github")) return Github;
  if (text.includes("mail") || text.includes("@")) return Mail;
  if (text.includes("twitter") || text.includes("x.com")) return Twitter;
  if (text.includes("youtube")) return Youtube;
  if (text.includes("bilibili")) return MonitorPlay;
  if (text.includes("wechat") || text.includes("weixin")) return MessageCircle;
  return Globe;
}
