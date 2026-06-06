"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: Locale[] = ["de", "en"];

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 sm:right-6 z-[100] flex items-center gap-2 text-sm tracking-wide"
      aria-label="Language"
    >
      {OPTIONS.map((code, index) => (
        <span key={code} className="flex items-center gap-2">
          {index > 0 && <span className="text-ink-faint select-none" aria-hidden>|</span>}
          <button
            type="button"
            data-cursor-interactive
            onClick={() => setLocale(code)}
            className={`uppercase transition-colors ${
              locale === code
                ? "text-ink font-medium"
                : "text-ink-muted hover:text-ink"
            }`}
            aria-pressed={locale === code}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
