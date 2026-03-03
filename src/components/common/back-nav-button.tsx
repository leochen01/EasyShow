"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

export function BackNavButton({ fallbackHref, label }: { fallbackHref: string; label: string }) {
  const router = useRouter();

  function onBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref as Route);
  }

  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
