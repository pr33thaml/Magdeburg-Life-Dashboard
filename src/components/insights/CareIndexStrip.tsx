"use client";

import { CHART_COLORS } from "@/lib/chart-theme";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface CareIndexStripProps {
  emergencyIndex: number;
  doctorsIndex: number;
  careGap: number;
}

export function CareIndexStrip({
  emergencyIndex,
  doctorsIndex,
  careGap,
}: CareIndexStripProps) {
  const t = useTranslations();
  const gapAbs = Math.abs(careGap);
  const lead = careGap > 2 ? "supply" : careGap < -2 ? "demand" : "even";

  const insight =
    lead === "even"
      ? t("charts.insights.reactor.careEvenLead")
      : lead === "supply"
        ? t("charts.insights.reactor.careSupplyLead").replace("{gap}", String(gapAbs))
        : t("charts.insights.reactor.careDemandLead").replace("{gap}", String(gapAbs));

  return (
    <div className="mt-6 pt-5 border-t border-border/50 w-full max-w-md mx-auto">
      <p className="text-[10px] uppercase tracking-wider text-ink-faint text-center mb-3">
        {t("charts.insights.reactor.careLabel")}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/70 bg-surface/80 px-2 py-2.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-ink-faint mb-0.5">
            {t("charts.insights.emergency")}
          </p>
          <p
            className="font-serif text-xl tabular-nums leading-none"
            style={{ color: CHART_COLORS.accent }}
          >
            {emergencyIndex}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface/80 px-2 py-2.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-ink-faint mb-0.5">
            {t("charts.insights.reactor.careGap")}
          </p>
          <p className="font-serif text-xl tabular-nums leading-none text-ink">
            {careGap > 0 ? `+${careGap}` : careGap}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface/80 px-2 py-2.5 text-center">
          <p className="text-[9px] uppercase tracking-wider text-ink-faint mb-0.5">
            {t("charts.insights.physicians")}
          </p>
          <p
            className="font-serif text-xl tabular-nums leading-none"
            style={{ color: CHART_COLORS.secondary }}
          >
            {doctorsIndex}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-ink-faint text-center mt-2">
        {t("charts.insights.reactor.careTension.baseline")}
      </p>
      <p className="text-xs text-ink-muted text-center mt-2 leading-relaxed">{insight}</p>
    </div>
  );
}
