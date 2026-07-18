"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home", active: (pathname: string) => pathname === "/" },
  { href: "/background", label: "Introduction", active: (pathname: string) => pathname === "/background" },
  { href: "/colossians/1", label: "Commentary", active: (pathname: string) => pathname.startsWith("/colossians") },
  { href: "/articles", label: "Study Guides", active: (pathname: string) => pathname === "/articles" || pathname.startsWith("/articles/") }
];

export function SiteHeader() {
  const pathname = usePathname();
  const activePathname = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  const [open, setOpen] = useState(false);

  return (
    <header className="reader-header no-print">
      <Link href="/" className="reader-brand" aria-label="Colossians Commentary Home">
        <span className="reader-logo" aria-hidden="true">
          <BookOpenText className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="reader-brand-text">
          <span className="reader-brand-strong">Colossians Commentary</span>
        </span>
      </Link>

      <nav className="reader-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={link.active(activePathname) ? "reader-nav-link reader-nav-link-active" : "reader-nav-link"}
            aria-current={link.active(activePathname) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="reader-header-actions">
        <button
          type="button"
          className="reader-menu-button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <nav className="reader-menu">
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={link.active(activePathname) ? "reader-menu-link reader-menu-link-active" : "reader-menu-link"}
                  aria-current={link.active(activePathname) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
