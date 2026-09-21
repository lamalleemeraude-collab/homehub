"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof document !== "undefined" && document.documentElement.requestFullscreen != null);

    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* navigateur ou tablette ne supporte pas */
    }
  }, []);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) await exit();
    else await enter();
  }, [enter, exit]);

  return { isFullscreen, supported, enter, exit, toggle };
}
