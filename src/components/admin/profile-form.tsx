"use client";

import { useState } from "react";

type ProfileData = {
  nameZh: string;
  titleZh: string;
  bioZh: string;
  nameEn: string;
  titleEn: string;
  bioEn: string;
  landingKickerZh: string;
  landingKickerEn: string;
  landingHeadlineZh: string;
  landingHeadlineEn: string;
  landingSublineZh: string;
  landingSublineEn: string;
  landingCtaSecondaryZh: string;
  landingCtaSecondaryEn: string;
  landingCtaSecondaryUrlZh: string;
  landingCtaSecondaryUrlEn: string;
  locationZh: string;
  locationEn: string;
  avatar: string;
  favicon: string;
  primaryColor: string;
  backgroundColor: string;
  seoTitleZh: string;
  seoTitleEn: string;
  seoDescriptionZh: string;
  seoDescriptionEn: string;
  worksPageSize: number;
  defaultLocale: "zh" | "en";
};

type InitialProfile = {
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
  favicon: string | null;
  primaryColor: string;
  backgroundColor: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoTitleZh: string | null;
  seoTitleEn: string | null;
  seoDescriptionZh: string | null;
  seoDescriptionEn: string | null;
  worksPageSize: number | null;
  defaultLocale: "zh" | "en";
};

type Props = {
  initial: InitialProfile | null;
};

const PRIMARY_PALETTE = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#0f172a"];
const BACKGROUND_PALETTE = ["#f8fafc", "#f1f5f9", "#ecfeff", "#f0fdf4", "#fffbeb", "#fdf2f8", "#111827"];

export function ProfileForm({ initial }: Props) {
  const [form, setForm] = useState<ProfileData>({
    nameZh: initial?.nameZh ?? "",
    titleZh: initial?.titleZh ?? "",
    bioZh: initial?.bioZh ?? "",
    nameEn: initial?.nameEn ?? "",
    titleEn: initial?.titleEn ?? "",
    bioEn: initial?.bioEn ?? "",
    landingKickerZh: initial?.landingKickerZh ?? "",
    landingKickerEn: initial?.landingKickerEn ?? "",
    landingHeadlineZh: initial?.landingHeadlineZh ?? "",
    landingHeadlineEn: initial?.landingHeadlineEn ?? "",
    landingSublineZh: initial?.landingSublineZh ?? "",
    landingSublineEn: initial?.landingSublineEn ?? "",
    landingCtaSecondaryZh: initial?.landingCtaSecondaryZh ?? "",
    landingCtaSecondaryEn: initial?.landingCtaSecondaryEn ?? "",
    landingCtaSecondaryUrlZh: initial?.landingCtaSecondaryUrlZh ?? "",
    landingCtaSecondaryUrlEn: initial?.landingCtaSecondaryUrlEn ?? "",
    locationZh: initial?.locationZh ?? initial?.location ?? "",
    locationEn: initial?.locationEn ?? "",
    avatar: initial?.avatar ?? "",
    favicon: initial?.favicon ?? "",
    primaryColor: initial?.primaryColor ?? "#0f172a",
    backgroundColor: initial?.backgroundColor ?? "#f8fafc",
    seoTitleZh: initial?.seoTitleZh ?? initial?.seoTitle ?? "",
    seoTitleEn: initial?.seoTitleEn ?? "",
    seoDescriptionZh: initial?.seoDescriptionZh ?? initial?.seoDescription ?? "",
    seoDescriptionEn: initial?.seoDescriptionEn ?? "",
    worksPageSize: initial?.worksPageSize ?? 8,
    defaultLocale: (initial?.defaultLocale as "zh" | "en") ?? "zh"
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setSaving(false);
    setMessage(response.ok ? "保存成功" : "保存失败");
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    setUploadingAvatar(false);

    if (!response.ok) {
      setMessage("头像上传失败");
      return;
    }

    const payload = (await response.json()) as { url: string };
    setForm((prev) => ({ ...prev, avatar: payload.url }));
    setMessage("头像上传成功");
  }

  async function uploadFavicon(file: File) {
    setUploadingFavicon(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    setUploadingFavicon(false);

    if (!response.ok) {
      setMessage("favicon 上传失败");
      return;
    }

    const payload = (await response.json()) as { url: string };
    setForm((prev) => ({ ...prev, favicon: payload.url }));
    setMessage("favicon 上传成功");
  }

  return (
    <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
      <section className="rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {form.avatar ? (
              <img src={form.avatar} alt="avatar preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No Avatar</div>
            )}
          </div>

          <label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700">
            {uploadingAvatar ? "上传中..." : "上传头像"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={async (e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (file) await uploadAvatar(file);
                input.value = "";
              }}
              disabled={uploadingAvatar}
            />
          </label>

          <span className="text-xs text-slate-500">建议上传 1:1 图片，显示为圆形蒙版。</span>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {form.favicon ? (
                <img src={form.favicon} alt="favicon preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">icon</div>
              )}
            </div>

            <label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700">
              {uploadingFavicon ? "上传中..." : "上传 favicon"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico,.svg"
                className="hidden"
                onChange={async (e) => {
                  const input = e.currentTarget;
                  const file = input.files?.[0];
                  if (file) await uploadFavicon(file);
                  input.value = "";
                }}
                disabled={uploadingFavicon}
              />
            </label>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="中文名" value={form.nameZh} onChange={(value) => setForm((f) => ({ ...f, nameZh: value }))} required />
        <Input label="英文名" value={form.nameEn} onChange={(value) => setForm((f) => ({ ...f, nameEn: value }))} required />
        <Input label="中文标题" value={form.titleZh} onChange={(value) => setForm((f) => ({ ...f, titleZh: value }))} />
        <Input label="英文标题" value={form.titleEn} onChange={(value) => setForm((f) => ({ ...f, titleEn: value }))} />
        <Input label="所在地（中文）" value={form.locationZh} onChange={(value) => setForm((f) => ({ ...f, locationZh: value }))} />
        <Input label="Location (EN)" value={form.locationEn} onChange={(value) => setForm((f) => ({ ...f, locationEn: value }))} />
        <Input label="头像 URL" value={form.avatar} onChange={(value) => setForm((f) => ({ ...f, avatar: value }))} />
        <Input label="Favicon URL" value={form.favicon} onChange={(value) => setForm((f) => ({ ...f, favicon: value }))} />
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
        <h3 className="md:col-span-2 text-sm font-semibold text-slate-700">Landing 文案配置（双语）</h3>
        <Input label="Kicker（中文）" value={form.landingKickerZh} onChange={(value) => setForm((f) => ({ ...f, landingKickerZh: value }))} />
        <Input label="Kicker（EN）" value={form.landingKickerEn} onChange={(value) => setForm((f) => ({ ...f, landingKickerEn: value }))} />
        <Input label="Headline（中文）" value={form.landingHeadlineZh} onChange={(value) => setForm((f) => ({ ...f, landingHeadlineZh: value }))} />
        <Input label="Headline（EN）" value={form.landingHeadlineEn} onChange={(value) => setForm((f) => ({ ...f, landingHeadlineEn: value }))} />
        <label className="grid gap-2 text-sm">
          <span className="text-slate-500">Subline（中文）</span>
          <textarea
            className="min-h-20 rounded-lg border border-slate-300 px-3 py-2"
            value={form.landingSublineZh}
            onChange={(e) => setForm((f) => ({ ...f, landingSublineZh: e.target.value }))}
            maxLength={300}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-500">Subline（EN）</span>
          <textarea
            className="min-h-20 rounded-lg border border-slate-300 px-3 py-2"
            value={form.landingSublineEn}
            onChange={(e) => setForm((f) => ({ ...f, landingSublineEn: e.target.value }))}
            maxLength={300}
          />
        </label>
        <Input
          label="CTA Secondary（中文）"
          value={form.landingCtaSecondaryZh}
          onChange={(value) => setForm((f) => ({ ...f, landingCtaSecondaryZh: value }))}
        />
        <Input
          label="CTA Secondary（EN）"
          value={form.landingCtaSecondaryEn}
          onChange={(value) => setForm((f) => ({ ...f, landingCtaSecondaryEn: value }))}
        />
        <Input
          label="CTA Secondary URL（中文）"
          value={form.landingCtaSecondaryUrlZh}
          onChange={(value) => setForm((f) => ({ ...f, landingCtaSecondaryUrlZh: value }))}
          type="url"
        />
        <Input
          label="CTA Secondary URL（EN）"
          value={form.landingCtaSecondaryUrlEn}
          onChange={(value) => setForm((f) => ({ ...f, landingCtaSecondaryUrlEn: value }))}
          type="url"
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <ColorPickerField
          label="主色"
          value={form.primaryColor}
          palette={PRIMARY_PALETTE}
          onChange={(value) => setForm((f) => ({ ...f, primaryColor: value }))}
        />
        <ColorPickerField
          label="背景色"
          value={form.backgroundColor}
          palette={BACKGROUND_PALETTE}
          onChange={(value) => setForm((f) => ({ ...f, backgroundColor: value }))}
        />
      </div>

      <label className="grid gap-2 text-sm">
        <span className="text-slate-500">中文简介</span>
        <textarea
          className="min-h-24 rounded-lg border border-slate-300 px-3 py-2"
          value={form.bioZh}
          onChange={(e) => setForm((f) => ({ ...f, bioZh: e.target.value }))}
          maxLength={500}
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="text-slate-500">英文简介</span>
        <textarea
          className="min-h-24 rounded-lg border border-slate-300 px-3 py-2"
          value={form.bioEn}
          onChange={(e) => setForm((f) => ({ ...f, bioEn: e.target.value }))}
          maxLength={500}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="SEO 标题（中文）" value={form.seoTitleZh} onChange={(value) => setForm((f) => ({ ...f, seoTitleZh: value }))} />
        <Input label="SEO Title (EN)" value={form.seoTitleEn} onChange={(value) => setForm((f) => ({ ...f, seoTitleEn: value }))} />
        <label className="grid gap-2 text-sm">
          <span className="text-slate-500">默认语言</span>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.defaultLocale}
            onChange={(e) => setForm((f) => ({ ...f, defaultLocale: e.target.value as "zh" | "en" }))}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-500">探索内容每页条数（1-24）</span>
          <input
            type="number"
            min={1}
            max={24}
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.worksPageSize}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value || "8", 10);
              const safe = Number.isFinite(next) ? Math.min(24, Math.max(1, next)) : 8;
              setForm((f) => ({ ...f, worksPageSize: safe }));
            }}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="text-slate-500">SEO 描述（中文）</span>
        <textarea
          className="min-h-20 rounded-lg border border-slate-300 px-3 py-2"
          value={form.seoDescriptionZh}
          onChange={(e) => setForm((f) => ({ ...f, seoDescriptionZh: e.target.value }))}
          maxLength={200}
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="text-slate-500">SEO Description (EN)</span>
        <textarea
          className="min-h-20 rounded-lg border border-slate-300 px-3 py-2"
          value={form.seoDescriptionEn}
          onChange={(e) => setForm((f) => ({ ...f, seoDescriptionEn: e.target.value }))}
          maxLength={200}
        />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">
          {saving ? "保存中..." : "保存"}
        </button>
        <span className="text-sm text-slate-500">{message}</span>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        type={type}
        className="rounded-lg border border-slate-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

function ColorPickerField({
  label,
  value,
  palette,
  onChange
}: {
  label: string;
  value: string;
  palette: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 p-3 text-sm">
      <span className="text-slate-500">{label}</span>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg border border-slate-300" style={{ backgroundColor: value }} />
        <div className="font-mono text-xs text-slate-700">{value.toUpperCase()}</div>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-10 cursor-pointer rounded border border-slate-300 bg-white p-1" />
      </div>

      <div className="flex flex-wrap gap-2">
        {palette.map((color) => (
          <button
            type="button"
            key={color}
            onClick={() => onChange(color)}
            className={`h-7 w-7 rounded-md border ${value.toLowerCase() === color.toLowerCase() ? "border-slate-900 ring-2 ring-slate-300" : "border-slate-300"}`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`${label}-${color}`}
          />
        ))}
      </div>
    </div>
  );
}
