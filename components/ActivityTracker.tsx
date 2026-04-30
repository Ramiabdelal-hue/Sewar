"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ActivityTracker — يتتبع pageviews عند كل تنقل
 * بديل نظيف عن <script dangerouslySetInnerHTML> في layout
 */
export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const email = (() => {
      try { return localStorage.getItem("userEmail") || null; } catch { return null; }
    })();

    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: email,
        eventType: "pageview",
        page: pathname,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
