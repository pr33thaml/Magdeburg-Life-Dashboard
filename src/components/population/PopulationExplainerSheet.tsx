"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";

export type PopulationChartId = "growth" | "age" | "natural" | "migration";

export interface PopulationExplainerContext {
  year: number;
  population?: number;
  averageAge?: number;
  births?: number;
  deaths?: number;
  naturalChange?: number;
  migrationIn?: number;
  migrationOut?: number;
  netMigration?: number;
}

const SECTIONS: Record<PopulationChartId, string[]> = {
  growth: ["headline", "brush", "equation"],
  age: ["average", "plateau", "care"],
  natural: ["gap", "births", "deaths"],
  migration: ["arrivals", "departures", "net", "offset"],
};

const SECTION_EMOJI: Record<string, string> = {
  headline: "📈",
  brush: "🔍",
  equation: "⚖️",
  average: "🎂",
  plateau: "📊",
  care: "🏥",
  gap: "📉",
  births: "👶",
  deaths: "🕯️",
  arrivals: "➡️",
  departures: "⬅️",
  net: "➕",
  offset: "🔗",
};

interface PopulationExplainerSheetProps {
  open: boolean;
  onClose: () => void;
  chartId: PopulationChartId;
  context: PopulationExplainerContext;
  initialSection?: string;
}

export function PopulationExplainerSheet({
  open,
  onClose,
  chartId,
  context,
  initialSection,
}: PopulationExplainerSheetProps) {
  const t = useTranslations();
  const { formatNumber, formatDecimal } = useFormatNumber();
  const [flipped, setFlipped] = useState(false);
  const sections = SECTIONS[chartId];
  const [selected, setSelected] = useState(sections[0]);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setFlipped(false);
      return;
    }
    setSelected(initialSection && sections.includes(initialSection) ? initialSection : sections[0]);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, chartId, initialSection, sections]);

  const noteBody = useMemo(() => {
    const key = `charts.population.explainer.${chartId}.${selected}`;
    return t(key)
      .replace("{year}", String(context.year))
      .replace("{population}", formatNumber(context.population ?? 0))
      .replace("{age}", formatDecimal(context.averageAge ?? 0, 1))
      .replace("{births}", formatNumber(context.births ?? 0))
      .replace("{deaths}", formatNumber(context.deaths ?? 0))
      .replace("{natural}", formatNumber(context.naturalChange ?? 0))
      .replace("{in}", formatNumber(context.migrationIn ?? 0))
      .replace("{out}", formatNumber(context.migrationOut ?? 0))
      .replace("{net}", formatNumber(context.netMigration ?? 0));
  }, [chartId, selected, context, t, formatNumber, formatDecimal]);

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="gap-explainer-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="population-explainer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        aria-label={t("charts.population.explainer.close")}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md mx-auto max-h-[min(92vh,720px)]">
        <div
          className={`gap-explainer-flip relative w-full transition-transform duration-700 ease-out ${
            flipped ? "gap-explainer-flip--back" : ""
          }`}
        >
          <div className="gap-explainer-face gap-explainer-face--front bg-surface border border-border shadow-elevated rounded-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
            <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-border/80 bg-canvas/50 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-1">
                    {t("charts.population.explainer.eyebrow")}
                  </p>
                  <h2 id="population-explainer-title" className="font-serif text-xl sm:text-2xl text-ink">
                    {t(`charts.population.explainer.titles.${chartId}`)}
                  </h2>
                  <p className="text-sm text-ink-muted mt-1">
                    {t("charts.population.explainer.yearContext").replace("{year}", String(context.year))}
                  </p>
                </div>
                <button
                  type="button"
                  data-cursor-interactive
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 rounded-full border border-border text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
                  aria-label={t("charts.population.explainer.close")}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 pb-8">
              <p className="text-center text-xs text-ink-faint mb-4">
                {t("charts.population.explainer.tapSection")}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {sections.map((id) => {
                  const active = selected === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-cursor-interactive
                      onClick={() => setSelected(id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "border-ink bg-ink text-surface"
                          : "border-border text-ink-muted hover:border-border-strong hover:text-ink bg-surface"
                      }`}
                    >
                      <span aria-hidden>{SECTION_EMOJI[id]}</span>
                      <span>{t(`charts.population.explainer.sections.${id}`)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center mb-3 text-3xl" aria-hidden>
                {SECTION_EMOJI[selected]}
              </div>

              <svg
                width="48"
                height="28"
                viewBox="0 0 48 28"
                className="mx-auto my-1 shrink-0 pointer-events-none block"
                aria-hidden
              >
                <line x1="24" y1="2" x2="24" y2="18" className="gap-callout-line" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="18" x2="36" y2="26" className="gap-callout-line" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: "0.12s" }} />
              </svg>

              <div
                key={`${chartId}-${selected}`}
                className="w-full gap-callout-card gap-callout-card--in rounded-xl border border-border/80 bg-[#FFFDF8] px-4 py-4 shadow-card"
              >
                <div className="flex justify-center">
                  <span className="gap-callout-pill gap-callout-pill--in">
                    {t(`charts.population.explainer.sections.${selected}`)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink font-sans text-center">{noteBody}</p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(true)}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium border border-accent/35 text-accent bg-accent-muted hover:bg-accent/10 transition-colors"
              >
                {t("charts.population.explainer.flipToMethod")}
              </button>
              <button
                type="button"
                data-cursor-interactive
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink-muted hover:text-ink transition-colors"
              >
                {t("charts.population.explainer.close")}
              </button>
            </div>
          </div>

          <div className="gap-explainer-face gap-explainer-face--back absolute inset-0 bg-surface border border-border shadow-elevated rounded-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border/80 shrink-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-1">
                {t("charts.population.explainer.methodEyebrow")}
              </p>
              <h2 className="font-serif text-xl text-ink">{t("charts.population.explainer.methodTitle")}</h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-sm text-ink-muted leading-relaxed">
              <p className="text-ink text-[15px]">{t(`charts.population.explainer.method.${chartId}`)}</p>
              <p>{t("charts.population.explainer.methodSource")}</p>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(false)}
                className="w-full px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink hover:bg-canvas transition-colors"
              >
                {t("charts.population.explainer.flipBack")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
