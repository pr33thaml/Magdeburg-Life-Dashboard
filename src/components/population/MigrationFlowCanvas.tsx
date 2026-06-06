"use client";

import { useMemo, useState } from "react";
import type { BirthDeathPoint, MigrationPoint } from "@/lib/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { YearSlider } from "@/components/ui/YearSlider";
import { YearRangePills } from "@/components/ui/YearRangePills";
import { CHART_COLORS } from "@/lib/chart-theme";
import { filterByRange, type YearRange } from "@/lib/chart-utils";
import type { PopulationChartId } from "@/components/population/PopulationExplainerSheet";
import { UnderstandThisButton } from "@/components/ui/UnderstandThisButton";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";

const VIEW_W = 1000;
const VIEW_H = 260;
const CENTER = VIEW_H / 2;
const PAD = 20;

function svgNum(n: number): number {
  return Math.round(n * 100) / 100;
}

interface MigrationFlowCanvasProps {
  migration: MigrationPoint[];
  birthsDeaths: BirthDeathPoint[];
  onExplain?: (chartId: PopulationChartId, year: number) => void;
}

export function MigrationFlowCanvas({ migration, birthsDeaths, onExplain }: MigrationFlowCanvasProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatNumber();
  const [yearRange, setYearRange] = useState<YearRange>("all");
  const [year, setYear] = useState(migration[migration.length - 1]?.year ?? 2024);
  const [showNetLine, setShowNetLine] = useState(true);

  const series = useMemo(
    () => migration.filter((d) => filterByRange([d], yearRange).length > 0),
    [migration, yearRange]
  );

  const years = useMemo(() => series.map((d) => d.year), [series]);
  const safeYear = years.includes(year) ? year : years[years.length - 1] ?? year;
  const row = series.find((d) => d.year === safeYear) ?? series[series.length - 1];
  const naturalRow = birthsDeaths.find((d) => d.year === safeYear);
  const yearIndex = Math.max(0, years.indexOf(safeYear));
  const playheadPct = years.length > 1 ? yearIndex / (years.length - 1) : 0;

  const peakYear = useMemo(() => {
    let best = series[0];
    for (const d of series) {
      if (d.migrationIn > (best?.migrationIn ?? 0)) best = d;
    }
    return best?.year ?? 2022;
  }, [series]);

  const { columns, netPts } = useMemo(() => {
    const flowMax = Math.max(
      ...series.map((d) => Math.max(d.migrationIn, d.migrationOut)),
      1
    );
    const netValues = series.map((d) => d.netMigration);
    const netMin = Math.min(...netValues, 0);
    const netMax = Math.max(...netValues, 1);
    const netSpan = netMax - netMin || 1;
    const laneH = CENTER - PAD - 8;

    const cols = series.map((d, i) => {
      const x = svgNum(years.length <= 1 ? VIEW_W / 2 : (i / (years.length - 1)) * VIEW_W);
      const inH = (d.migrationIn / flowMax) * laneH;
      const outH = (d.migrationOut / flowMax) * laneH;
      return {
        year: d.year,
        x,
        inTop: svgNum(CENTER - inH),
        inBottom: CENTER,
        outTop: CENTER,
        outBottom: svgNum(CENTER + outH),
        isPeak: d.year === peakYear,
      };
    });

    const nets = series.map((d, i) => ({
      x: svgNum(years.length <= 1 ? VIEW_W / 2 : (i / (years.length - 1)) * VIEW_W),
      y: svgNum(PAD + ((netMax - d.netMigration) / netSpan) * (CENTER - PAD * 2 - 24)),
    }));

    return { columns: cols, netPts: nets };
  }, [series, years.length, peakYear]);

  const netPositive = (row?.netMigration ?? 0) >= 0;

  const insight = t("charts.population.migrationFlow.yearInsight")
    .replace("{year}", String(safeYear))
    .replace("{in}", formatNumber(row?.migrationIn ?? 0))
    .replace("{out}", formatNumber(row?.migrationOut ?? 0))
    .replace("{net}", formatNumber(row?.netMigration ?? 0));

  const offsetNote =
    naturalRow && row && row.netMigration + naturalRow.naturalChange > 0
      ? t("charts.population.migrationFlow.offsetsDeficit")
          .replace("{net}", formatNumber(row.netMigration))
          .replace("{natural}", formatNumber(naturalRow.naturalChange))
      : null;

  const handleColumnClick = (index: number) => {
    const y = years[index];
    if (y !== undefined) setYear(y);
  };

  return (
    <div className="pressure-canvas card overflow-hidden border-border" data-cursor-interactive>
      <div className="relative px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4 border-b border-border/80">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 100% 0%, rgba(139, 203, 122, 0.1), transparent 55%), radial-gradient(ellipse 50% 45% at 0% 100%, rgba(61, 155, 130, 0.08), transparent 48%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1.5">
              {t("charts.population.migrationFlow.eyebrow")}
            </p>
            <h3 className="font-sans text-sm font-medium text-ink">
              {t("charts.population.migration.title")}
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-md">
              {t("charts.population.migrationFlow.subtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-border/60">
            {onExplain && (
              <UnderstandThisButton
                label={t("charts.population.explainer.open")}
                onClick={() => onExplain("migration", safeYear)}
                className="self-start"
              />
            )}
            <YearRangePills value={yearRange} onChange={setYearRange} />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 border-b border-border/60 bg-canvas/25">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">
              {t("charts.population.migration.net")}
            </p>
            <AnimatedNumber
              value={row?.netMigration ?? 0}
              size="lg"
              className={`block leading-tight ${netPositive ? "text-accent" : "text-[#B83A32]"}`}
            />
            <p className="text-xs text-ink-muted mt-1 tabular-nums">{safeYear}</p>
          </div>
          <div>
            <span
              className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
              style={{ backgroundColor: CHART_COLORS.migrationIn }}
            />
            <span className="text-[10px] uppercase tracking-wider text-ink-faint">
              {t("charts.population.migration.in")}
            </span>
            <AnimatedNumber value={row?.migrationIn ?? 0} size="sm" className="text-ink block mt-1" />
          </div>
          <div>
            <span
              className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
              style={{ backgroundColor: CHART_COLORS.migrationOut }}
            />
            <span className="text-[10px] uppercase tracking-wider text-ink-faint">
              {t("charts.population.migration.out")}
            </span>
            <AnimatedNumber value={row?.migrationOut ?? 0} size="sm" className="text-ink block mt-1" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-7">
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <p className="text-[10px] uppercase tracking-wider text-ink-faint">
            {t("charts.population.migrationFlow.divergingLabel")}
          </p>
          <button
            type="button"
            data-cursor-interactive
            onClick={() => setShowNetLine((v) => !v)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors shrink-0 ${
              showNetLine
                ? "bg-accent-muted text-accent border-accent/30"
                : "bg-canvas text-ink-muted border-border"
            }`}
          >
            {showNetLine
              ? t("charts.population.migrationFlow.netOn")
              : t("charts.population.migrationFlow.netOff")}
          </button>
        </div>

        <div className="relative mx-[11px]">
          <div
            className="pressure-playhead absolute top-0 bottom-0 w-px pointer-events-none z-10"
            style={{ left: `${playheadPct * 100}%` }}
            aria-hidden
          />

          <div className="relative h-[240px] sm:h-[260px] rounded-xl overflow-hidden bg-canvas/50 border border-border/60">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              role="img"
              aria-label={t("charts.population.migration.title")}
            >
              <line
                x1={0}
                y1={CENTER}
                x2={VIEW_W}
                y2={CENTER}
                stroke="#D8D4CC"
                strokeWidth="1.5"
              />

              {showNetLine && netPts.length > 1 && (
                <>
                  <polyline
                    points={netPts.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={CHART_COLORS.migrationNet}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 4"
                    vectorEffect="non-scaling-stroke"
                    opacity={0.85}
                  />
                  {netPts[yearIndex] && (
                    <circle
                      cx={netPts[yearIndex].x}
                      cy={netPts[yearIndex].y}
                      r="4.5"
                      fill="#FAF9F7"
                      stroke={CHART_COLORS.migrationNet}
                      strokeWidth="2"
                    />
                  )}
                </>
              )}

              {columns.map((col) => {
                const w = years.length > 1 ? (VIEW_W / years.length) * 0.55 : 40;
                const active = col.year === safeYear;
                const opacity = safeYear === col.year ? 1 : 0.72;
                return (
                  <g key={col.year} opacity={opacity}>
                    <rect
                      x={col.x - w / 2}
                      y={col.inTop}
                      width={w}
                      height={col.inBottom - col.inTop}
                      rx={3}
                      fill={CHART_COLORS.migrationIn}
                      fillOpacity={active ? 0.95 : 0.7}
                    />
                    <rect
                      x={col.x - w / 2}
                      y={col.outTop}
                      width={w}
                      height={col.outBottom - col.outTop}
                      rx={3}
                      fill={CHART_COLORS.migrationOut}
                      fillOpacity={active ? 0.85 : 0.55}
                    />
                    {col.isPeak && (
                      <circle
                        cx={col.x}
                        cy={col.inTop - 6}
                        r="3"
                        fill={CHART_COLORS.accent}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 flex">
              {years.map((y, i) => (
                <button
                  key={y}
                  type="button"
                  data-cursor-interactive
                  className="flex-1 h-full focus:outline-none"
                  aria-label={`${y}`}
                  onClick={() => handleColumnClick(i)}
                >
                  <span
                    className={`block h-full mx-px rounded-sm transition-colors ${
                      y === safeYear ? "bg-accent/8" : "hover:bg-accent/4"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-0.5 text-[10px] text-ink-faint">
            <span>{t("charts.population.migration.in")}</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {t("charts.population.migrationFlow.peakYear")}: {peakYear}
            </span>
            <span>{t("charts.population.migration.out")}</span>
          </div>
        </div>

        <div className="mt-7 px-1">
          <p className="text-xs text-ink-faint mb-2">
            {t("charts.population.migrationFlow.slideYears")}
          </p>
          <YearSlider years={years} value={safeYear} onChange={setYear} />
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-border/80 bg-canvas/35 space-y-2">
        <p className="text-sm text-ink leading-relaxed">{insight}</p>
        {offsetNote && <p className="text-sm text-accent font-medium leading-relaxed">{offsetNote}</p>}
        {safeYear === peakYear && (
          <p className="text-xs text-ink-muted">
            {t("charts.population.migrationFlow.peakNote").replace(
              "{net}",
              formatNumber(row?.netMigration ?? 0)
            )}
          </p>
        )}
      </div>
    </div>
  );
}
