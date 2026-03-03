"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const query = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
    const fullPath = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedRef.current === fullPath) return;
    lastTrackedRef.current = fullPath;

    const payload = JSON.stringify({
      pathname: fullPath,
      referrer: document.referrer || null
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    });
  }, [pathname]);

  return null;
}
