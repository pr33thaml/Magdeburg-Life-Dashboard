"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { AccessLensDistrict, DistrictSummary, LensId } from "@/lib/types";
import { buildLensNotes } from "@/lib/gap-explainer-notes";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";
import {
  COMPOUND_GAP_COLOR,
  gapFraction,
  isCompoundGap,
  isLensWeak,
  LENS_IDS,
} from "@/lib/access-lens";
import { InteractiveGapPrism } from "./InteractiveGapPrism";

interface GapExplainerSheetProps {
  open: boolean;
  onClose: () => void;
  district: DistrictSummary;
  lens: AccessLensDistrict;
  activeLenses: Set<LensId>;
  busStopRadiusKm?: number;
  magdeburgBusStops?: number;
}

function defaultSelectedLens(
  lens: AccessLensDistrict,
  activeLenses: Set<LensId>
): LensId | null {
  const weak = LENS_IDS.find((id) => activeLenses.has(id) && isLensWeak(lens, id));
  if (weak) return weak;
  const first = LENS_IDS.find((id) => activeLenses.has(id));
  return first ?? null;
}

export function GapExplainerSheet({
  open,
  onClose,
  district,
  lens,
  activeLenses,
  busStopRadiusKm = 1.2,
  magdeburgBusStops = 0,
}: GapExplainerSheetProps) {
  const t = useTranslations();
  const { formatNumber, formatDecimal } = useFormatNumber();
  const [flipped, setFlipped] = useState(false);
  const [selectedLens, setSelectedLens] = useState<LensId | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setFlipped(false);
      setSelectedLens(null);
      return;
    }
    setSelectedLens(defaultSelectedLens(lens, activeLenses));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, lens, activeLenses]);

  const gap = gapFraction(lens, activeLenses);
  const compound = isCompoundGap(lens, activeLenses);

  const lensNotes = useMemo(
    () =>
      buildLensNotes(
        lens,
        district,
        activeLenses,
        t,
        formatNumber,
        formatDecimal,
        busStopRadiusKm,
        magdeburgBusStops
      ),
    [lens, district, activeLenses, t, formatNumber, formatDecimal, busStopRadiusKm, magdeburgBusStops]
  );

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="gap-explainer-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gap-explainer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        aria-label={t("map.gapExplainer.close")}
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
                    {t("map.gapExplainer.eyebrow")}
                  </p>
                  <h2 id="gap-explainer-title" className="font-serif text-2xl text-ink truncate">
                    {district.district}
                  </h2>
                  <p className="text-sm text-ink-muted mt-1">
                    {t("map.gapExplainer.gapScore")
                      .replace("{weak}", String(gap.weak))
                      .replace("{total}", String(gap.total))}
                  </p>
                </div>
                <button
                  type="button"
                  data-cursor-interactive
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 rounded-full border border-border text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
                  aria-label={t("map.gapExplainer.close")}
                >
                  ×
                </button>
              </div>
              {compound && (
                <p
                  className="mt-3 text-sm font-medium text-ink px-3 py-2 rounded-lg border"
                  style={{
                    color: COMPOUND_GAP_COLOR,
                    borderColor: `${COMPOUND_GAP_COLOR}35`,
                    backgroundColor: `${COMPOUND_GAP_COLOR}10`,
                  }}
                >
                  {t("map.gapExplainer.tripleGapNote").replace("{district}", district.district)}
                </p>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 pb-8">
              <InteractiveGapPrism
                district={lens}
                activeLenses={activeLenses}
                notes={lensNotes}
                selectedId={selectedLens}
                onSelect={setSelectedLens}
              />
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(true)}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium border border-accent/35 text-accent bg-accent-muted hover:bg-accent/10 transition-colors"
              >
                {t("map.gapExplainer.flipToMethod")}
              </button>
              <button
                type="button"
                data-cursor-interactive
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink-muted hover:text-ink transition-colors"
              >
                {t("map.gapExplainer.close")}
              </button>
            </div>
          </div>

          <div className="gap-explainer-face gap-explainer-face--back absolute inset-0 bg-surface border border-border shadow-elevated rounded-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border/80 shrink-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-1">
                {t("map.gapExplainer.methodEyebrow")}
              </p>
              <h2 className="font-serif text-xl text-ink">{t("map.gapExplainer.methodTitle")}</h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-sm text-ink-muted leading-relaxed">
              <p className="text-ink text-[15px] leading-relaxed">{t("map.gapExplainer.tertile")}</p>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-1">
                  {t("map.gapExplainer.mapTitle")}
                </p>
                <p>{t("map.gapExplainer.mapBody")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-1">
                  {t("map.gapExplainer.dataTitle")}
                </p>
                <p>{t("map.gapExplainer.dataBody")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-1">
                  {t("map.gapExplainer.lensesTitle")}
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>{t("map.gapExplainer.lensMethod.physicians")}</li>
                  <li>{t("map.gapExplainer.lensMethod.elderly")}</li>
                  <li>
                    {t("map.gapExplainer.lensMethod.transit").replace(
                      "{radius}",
                      formatDecimal(busStopRadiusKm, 1)
                    )}
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(false)}
                className="w-full px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink hover:bg-canvas transition-colors"
              >
                {t("map.gapExplainer.flipBack")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
