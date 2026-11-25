"use client";

import { useEffect } from "react";

/**
 * ServerKeepAlive component:
 * 1. Proactively pings /api/health on initial app load to trigger cloud container wake-up early.
 * 2. Sends a lightweight keep-alive ping every 10 minutes to prevent Render free-tier hibernation while user is active.
 */
export function ServerKeepAlive() {
  useEffect(() => {
    // Immediate wake-up probe on initial site visit
    const wakeUp = () => {
      fetch("/api/health", { method: "GET", cache: "no-store" }).catch(() => {
        // Silently ignore network errors during container wake-up
      });
    };

    wakeUp();

    // Periodic keep-alive ping every 10 minutes (600,000 ms)
    const interval = setInterval(wakeUp, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
