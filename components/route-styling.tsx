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
    } else body.removeAttribute("data-colossians-route");
  }, [pathname]);

  return null;
}
