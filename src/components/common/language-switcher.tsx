"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";

type Locale = "zh" | "en";

export function LanguageSwitcher({
  currentLocale,
  zhPath,
  enPath,
  className
}: {
  currentLocale: Locale;
  zhPath: string;
  enPath: string;
  className?: string;
}) {
  const [dimmed, setDimmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDimmed(true), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function resetDimTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDimmed(false);
    timerRef.current = setTimeout(() => setDimmed(true), 5000);
  }

  const isEn = currentLocale === "en";
  const nextHref = (isEn ? zhPath : enPath) as Route;

  return (
    <div
      className={`fixed right-2.5 top-2.5 z-50 transition-opacity duration-300 md:right-4 md:top-4 ${
        dimmed ? "opacity-40" : "opacity-100"
      } ${className ?? ""}`}
      onMouseEnter={resetDimTimer}
      onMouseLeave={resetDimTimer}
    >
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/82 px-2 py-1 shadow-[0_4px_12px_rgba(15,23,42,0.12)] backdrop-blur">
        <span className={`text-[10px] font-medium leading-none transition ${isEn ? "text-slate-400" : "text-slate-900"}`}>中</span>
        <Link
          href={nextHref}
          aria-label={isEn ? "Switch to Chinese" : "Switch to English"}
          className="relative h-[18px] w-8 rounded-full bg-slate-300 transition"
        >
          <span
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_2px_4px_rgba(15,23,42,0.25)] transition-transform ${
              isEn ? "translate-x-[16px]" : "translate-x-[2px]"
            }`}
          />
        </Link>
        <span className={`text-[10px] font-medium leading-none transition ${isEn ? "text-slate-900" : "text-slate-400"}`}>EN</span>
      </div>
    </div>
  );
}
