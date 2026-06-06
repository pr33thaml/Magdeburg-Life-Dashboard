"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";

export type ReactorExplainerSection = "balance" | "stats" | "care" | "timeline";

export interface ReactorExplainerContext {
  year: number;
  naturalChange: number;
  netMigration: number;
  popDelta: number;
  population: number;
  emergencyIndex: number;
  doctorsIndex: number;
  careGap: number;
}

const SECTIONS: ReactorExplainerSection[] = ["balance", "stats", "care", "timeline"];

const SECTION_EMOJI: Record<ReactorExplainerSection, string> = {
  balance: "⚖️",
  stats: "📊",
  care: "🏥",
  timeline: "▶️",
};

interface ReactorExplainerSheetProps {
  open: boolean;
  onClose: () => void;
  context: ReactorExplainerContext;
  initialSection?: ReactorExplainerSection;
}

export function ReactorExplainerSheet({
  open,
  onClose,
  context,
  initialSection = "balance",
}: ReactorExplainerSheetProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatNumber();
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<ReactorExplainerSection>(initialSection);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setFlipped(false);
      return;
    }
    setSelected(initialSection);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, initialSection]);

  const noteBody = useMemo(() => {
    const gapStr =
      context.careGap > 0 ? `+${context.careGap}` : String(context.careGap);
    return t(`charts.insights.reactor.explainer.${selected}`)
      .replace("{year}", String(context.year))
      .replace("{natural}", formatNumber(context.naturalChange))
      .replace("{migration}", formatNumber(context.netMigration))
      .replace("{popDelta}", formatNumber(context.popDelta))
      .replace("{population}", formatNumber(context.population))
      .replace("{emerg}", String(context.emergencyIndex))
      .replace("{docs}", String(context.doctorsIndex))
      .replace("{gap}", gapStr);
  }, [selected, context, t, formatNumber]);

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="gap-explainer-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reactor-explainer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        aria-label={t("charts.insights.reactor.explainer.close")}
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
                    {t("charts.insights.reactor.explainer.eyebrow")}
                  </p>
                  <h2 id="reactor-explainer-title" className="font-serif text-xl sm:text-2xl text-ink">
                    {t("charts.insights.reactor.explainer.title")}
                  </h2>
                  <p className="text-sm text-ink-muted mt-1">
                    {t("charts.insights.reactor.explainer.yearContext").replace(
                      "{year}",
                      String(context.year)
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  data-cursor-interactive
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 rounded-full border border-border text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
                  aria-label={t("charts.insights.reactor.explainer.close")}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 pb-8">
              <p className="text-center text-xs text-ink-faint mb-4">
                {t("charts.insights.reactor.explainer.tapSection")}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {SECTIONS.map((id) => {
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
                      <span>{t(`charts.insights.reactor.explainer.sections.${id}`)}</span>
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
                <line
                  x1="24"
                  y1="2"
                  x2="24"
                  y2="18"
                  className="gap-callout-line"
                  stroke="#2D4A3E"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="24"
                  y1="18"
                  x2="36"
                  y2="26"
                  className="gap-callout-line"
                  stroke="#2D4A3E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ animationDelay: "0.12s" }}
                />
              </svg>

              <div
                key={selected}
                className="w-full gap-callout-card gap-callout-card--in rounded-xl border border-border/80 bg-[#FFFDF8] px-4 py-4 shadow-card"
              >
                <div className="flex justify-center">
                  <span className="gap-callout-pill gap-callout-pill--in">
                    {t(`charts.insights.reactor.explainer.sections.${selected}`)}
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
                {t("charts.insights.reactor.explainer.flipToMethod")}
              </button>
              <button
                type="button"
                data-cursor-interactive
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink-muted hover:text-ink transition-colors"
              >
                {t("charts.insights.reactor.explainer.close")}
              </button>
            </div>
          </div>

          <div className="gap-explainer-face gap-explainer-face--back absolute inset-0 bg-surface border border-border shadow-elevated rounded-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border/80 shrink-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-1">
                {t("charts.insights.reactor.explainer.methodEyebrow")}
              </p>
              <h2 className="font-serif text-xl text-ink">
                {t("charts.insights.reactor.explainer.methodTitle")}
              </h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-sm text-ink-muted leading-relaxed">
              <p className="text-ink text-[15px]">{t("charts.insights.reactor.explainer.methodIntro")}</p>
              <p>{t("charts.insights.reactor.explainer.methodSource")}</p>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(false)}
                className="w-full px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink hover:bg-canvas transition-colors"
              >
                {t("charts.insights.reactor.explainer.flipBack")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
