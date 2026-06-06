"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

const LINKS = [
  { href: "#overview", key: "nav.overview" },
  { href: "#population", key: "nav.population" },
  { href: "#emergency", key: "nav.emergency" },
  { href: "#healthcare", key: "nav.healthcare" },
  { href: "#insights", key: "nav.insights" },
] as const;

export function MobileNav() {
  const t = useTranslations();

  return (
    <nav
      className="mobile-nav md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
      aria-label="Section navigation"
    >
      <div className="flex items-stretch justify-around max-w-6xl mx-auto px-1 pb-[env(safe-area-inset-bottom)]">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="mobile-nav-link flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 text-[10px] font-medium text-ink-muted hover:text-ink active:text-accent transition-colors"
          >
            <span className="truncate max-w-full text-center leading-tight">
              {t(link.key)}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
