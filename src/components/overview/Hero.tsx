"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

export function Hero() {
  const t = useTranslations();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-24 pb-6 sm:pb-8">
      <div className="max-w-3xl animate-fade-in">
        <p className="section-eyebrow mb-4">{t("hero.eyebrow")}</p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.08] mb-5 sm:mb-6">
          <span className="block">{t("hero.titleLine1")}</span>
          <span className="block mt-1 sm:mt-1.5">{t("hero.titleLine2")}</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-ink-muted leading-relaxed max-w-2xl">
          {t("hero.lead")}
        </p>
      </div>
    </div>
  );
}
