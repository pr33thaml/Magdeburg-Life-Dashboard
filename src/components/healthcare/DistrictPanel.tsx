"use client";

import { useState } from "react";
import type { AccessLensDistrict, DistrictSummary, LensId, RiskDistrict } from "@/lib/types";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { RISK_LEVEL_STYLES } from "@/lib/risk-styles";
import { LENS_COLORS, isCompoundGap, LENS_IDS, gapFraction } from "@/lib/access-lens";
import { GapExplainerSheet } from "./GapExplainerSheet";
import { LensPrism } from "./LensPrism";

interface DistrictPanelProps {
  district: DistrictSummary | null;
  risk?: RiskDistrict;
  lens?: AccessLensDistrict;
  activeLenses?: Set<LensId>;
  showLens?: boolean;
  busStopRadiusKm?: number;
  magdeburgBusStops?: number;
}

function levelLabel(t: (k: string) => string, level: string): string {
  return t(`map.lens.levels.${level}`);
}

export function DistrictPanel({
  district,
  risk,
  lens,
  activeLenses = new Set(["physicians", "transport", "transit"]),
  showLens = false,
  busStopRadiusKm,
  magdeburgBusStops,
}: DistrictPanelProps) {
  const t = useTranslations();
  const { formatNumber, formatDecimal } = useFormatNumber();
  const [explainerOpen, setExplainerOpen] = useState(false);

  if (!district) {
    return (
      <div className="h-full min-h-[220px] sm:min-h-[320px] lg:min-h-[480px] flex flex-col justify-center rounded-lg border border-dashed border-border bg-canvas/50 p-4 sm:p-6">
        <p className="text-sm font-medium text-ink mb-2">{t("map.panel.title")}</p>
        <p className="text-sm text-ink-muted leading-relaxed">{t("map.panel.hint")}</p>
      </div>
    );
  }

  const compound = lens && showLens && isCompoundGap(lens, activeLenses);
  const gap = lens && showLens ? gapFraction(lens, activeLenses) : null;

  return (
    <div className="h-full min-h-0 lg:min-h-[480px] rounded-lg border border-border bg-surface p-4 sm:p-6 flex flex-col animate-fade-in">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-1">
        {t("map.panel.selected")}
      </p>
      <h3 className="font-serif text-2xl text-ink mb-2">{district.district}</h3>

      {compound && (
        <span
          className="inline-block self-start mb-4 px-2.5 py-1 text-xs font-medium rounded-md border"
          style={{
            color: "#6B2D5C",
            borderColor: "#6B2D5C40",
            backgroundColor: "#6B2D5C12",
          }}
        >
          {t("map.lens.tripleGap")}
        </span>
      )}

      {showLens && lens && (
        <div className="space-y-3 mb-6 pb-5 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-ink-muted">{t("map.lens.panelTitle")}</p>
            <div className="flex items-center gap-2">
              <LensPrism district={lens} activeLenses={activeLenses} size={36} />
              {gap && (
                <span className="text-xs font-serif tabular-nums text-ink-muted">
                  {gap.weak}/{gap.total}
                </span>
              )}
            </div>
          </div>
          {LENS_IDS.map((id) => {
            const active = activeLenses.has(id);
            const level =
              id === "physicians"
                ? lens.physicianLevel
                : id === "transport"
                  ? lens.transportLevel
                  : lens.transitLevel;
            const value =
              id === "physicians"
                ? `${formatDecimal(lens.physiciansPer1000, 2)} / 1k`
                : id === "transport"
                  ? `${formatDecimal(district.elderlyPct ?? 0, 1)}%`
                  : `${formatNumber(lens.busStopsNearby)} ${t("map.lens.popup.transitShort")}`;

            return (
              <div
                key={id}
                className={`flex items-center justify-between gap-2 ${active ? "" : "opacity-40"}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: LENS_COLORS[level] }}
                  />
                  <span className="text-xs text-ink-muted truncate">
                    {t(`map.lens.toggles.${id}`)}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-ink tabular-nums">{value}</p>
                  <p className="text-[10px] text-ink-faint">{levelLabel(t, level)}</p>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            data-cursor-interactive
            onClick={() => setExplainerOpen(true)}
            className="w-full mt-2 px-4 py-2.5 rounded-full text-sm font-medium border border-accent/30 text-accent bg-accent-muted/80 hover:bg-accent/10 transition-all hover:shadow-soft"
          >
            {t("map.gapExplainer.open")}
          </button>
        </div>
      )}

      {showLens && lens && district && (
        <GapExplainerSheet
          open={explainerOpen}
          onClose={() => setExplainerOpen(false)}
          district={district}
          lens={lens}
          activeLenses={activeLenses}
          busStopRadiusKm={busStopRadiusKm}
          magdeburgBusStops={magdeburgBusStops}
        />
      )}

      <div className="space-y-5 flex-1">
        <div>
          <p className="text-xs text-ink-faint mb-1">{t("map.panel.physiciansPer1k")}</p>
          <p className="font-serif text-3xl text-ink tabular-nums">
            {formatDecimal(district.ratioPer1000, 2)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-ink-faint mb-1">{t("map.panel.population")}</p>
            <p className="text-sm font-medium text-ink tabular-nums">
              {formatNumber(district.population)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-1">{t("map.panel.elderly")}</p>
            <p className="text-sm font-medium text-ink tabular-nums">
              {formatDecimal(district.elderlyPct ?? 0, 1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-1">{t("map.panel.physicians")}</p>
            <p className="text-sm font-medium text-ink tabular-nums">{district.doctors}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-1">{t("map.panel.pharmacies")}</p>
            <p className="text-sm font-medium text-ink tabular-nums">{district.pharmacies}</p>
          </div>
        </div>

        {risk && (
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-xs text-ink-faint mb-2">{t("map.panel.vulnerability")}</p>
            <span
              className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${RISK_LEVEL_STYLES[risk.riskLevel]}`}
            >
              {t(`risk.levels.${risk.riskLevel}`)} {t("map.panel.riskRank")} · #{risk.rank}
            </span>
            <p className="text-xs text-ink-muted mt-3 leading-relaxed">{risk.rationale}</p>
          </div>
        )}
      </div>
    </div>
  );
}
