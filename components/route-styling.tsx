"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteStyling() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const path = pathname.replace(/\/$/, "") || "/";
    const chapterMatch = path.match(/^\/colossians\/(\d+)$/);

    const resetReaderViewport = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      html.scrollTop = 0;
      body.scrollTop = 0;
    };

    html.classList.add("dark");
    html.style.colorScheme = "dark";
    body.classList.add("mbe-shell-managed");
    body.removeAttribute("data-colossians-chapter");

    if (path === "/") body.dataset.colossiansRoute = "home";
    else if (path === "/background") body.dataset.colossiansRoute = "introduction";
    else if (path === "/articles" || path.startsWith("/articles/")) body.dataset.colossiansRoute = "articles";
    else if (chapterMatch) {
      body.dataset.colossiansRoute = "commentary";
      body.dataset.colossiansChapter = chapterMatch[1];
      resetReaderViewport();
    } else body.removeAttribute("data-colossians-route");
  }, [pathname]);

  return null;
}
