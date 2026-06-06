"use client";

import { useMemo, useState } from "react";
import type { BirthDeathPoint } from "@/lib/types";
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
const VIEW_H = 200;
const PAD_Y = 14;

function svgNum(n: number): number {
  return Math.round(n * 100) / 100;
}

function toggleSet(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

interface NaturalDeficitCanvasProps {
  data: BirthDeathPoint[];
  onExplain?: (chartId: PopulationChartId, year: number) => void;
}

export function NaturalDeficitCanvas({ data, onExplain }: NaturalDeficitCanvasProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatNumber();
  const [yearRange, setYearRange] = useState<YearRange>("all");
  const [year, setYear] = useState(data[data.length - 1]?.year ?? 2024);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const series = useMemo(
    () => data.filter((d) => filterByRange([d], yearRange).length > 0),
    [data, yearRange]
  );

  const years = useMemo(() => series.map((d) => d.year), [series]);
  const safeYear = years.includes(year) ? year : years[years.length - 1] ?? year;
  const row = series.find((d) => d.year === safeYear) ?? series[series.length - 1];
  const yearIndex = Math.max(0, years.indexOf(safeYear));
  const playheadPct = years.length > 1 ? yearIndex / (years.length - 1) : 0;

  const { yMin, yMax, birthPts, deathPts, deficitPath } = useMemo(() => {
    const lo = Math.min(...series.map((d) => d.births)) - 80;
    const hi = Math.max(...series.map((d) => d.deaths)) + 80;
    const span = hi - lo || 1;
    const chartH = VIEW_H - PAD_Y * 2;

    const toY = (v: number) => svgNum(PAD_Y + chartH - ((v - lo) / span) * chartH);

    const bPts = series.map((d, i) => ({
      x: svgNum(years.length <= 1 ? VIEW_W / 2 : (i / (years.length - 1)) * VIEW_W),
      y: toY(d.births),
    }));
    const dPts = series.map((d, i) => ({
      x: svgNum(years.length <= 1 ? VIEW_W / 2 : (i / (years.length - 1)) * VIEW_W),
      y: toY(d.deaths),
    }));

    let path = "";
    if (bPts.length > 0 && dPts.length > 0) {
      const forward = dPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
      const back = [...bPts]
        .reverse()
        .map((p, i) => `${i === 0 ? "L" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      path = `${forward} ${back} Z`;
    }

    return { yMin: lo, yMax: hi, birthPts: bPts, deathPts: dPts, deficitPath: path };
  }, [series, years.length]);

  const deathRatio =
    row && row.births > 0 ? (row.deaths / row.births).toFixed(1) : "—";

  const insight = t("charts.population.naturalDeficit.yearInsight")
    .replace("{year}", String(safeYear))
    .replace("{births}", formatNumber(row?.births ?? 0))
    .replace("{deaths}", formatNumber(row?.deaths ?? 0))
    .replace("{gap}", formatNumber(Math.abs(row?.naturalChange ?? 0)));

  const handleColumnClick = (index: number) => {
    const y = years[index];
    if (y !== undefined) setYear(y);
  };

  return (
    <div className="pressure-canvas card overflow-hidden border-border" data-cursor-interactive>
      <div className="relative px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4 border-b border-border/80">
        <div className="pressure-canvas-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1.5">
              {t("charts.population.naturalDeficit.eyebrow")}
            </p>
            <h3 className="font-sans text-sm font-medium text-ink">
              {t("charts.population.birthsDeaths.title")}
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-md">
              {t("charts.population.naturalDeficit.subtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-border/60">
            {onExplain && (
              <UnderstandThisButton
                label={t("charts.population.explainer.open")}
                onClick={() => onExplain("natural", safeYear)}
                className="self-start"
              />
            )}
            <YearRangePills value={yearRange} onChange={setYearRange} />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 border-b border-border/60 bg-canvas/25">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">
              {t("charts.population.birthsDeaths.naturalChange")}
            </p>
            <AnimatedNumber
              value={row?.naturalChange ?? 0}
              size="lg"
              className="text-[#B83A32] block leading-tight"
            />
            <p className="text-xs text-ink-muted mt-1 tabular-nums">{safeYear}</p>
          </div>
          <div>
            <button
              type="button"
              data-cursor-interactive
              onClick={() => setHidden((p) => toggleSet(p, "births"))}
              className={`text-left w-full rounded-lg px-2 py-1 -mx-2 transition-opacity ${
                hidden.has("births") ? "opacity-40" : "opacity-100"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                style={{ backgroundColor: CHART_COLORS.birth }}
              />
              <span className="text-[10px] uppercase tracking-wider text-ink-faint">
                {t("charts.population.birthsDeaths.births")}
              </span>
              <AnimatedNumber
                value={row?.births ?? 0}
                size="sm"
                className="text-ink block mt-1"
              />
            </button>
          </div>
          <div>
            <button
              type="button"
              data-cursor-interactive
              onClick={() => setHidden((p) => toggleSet(p, "deaths"))}
              className={`text-left w-full rounded-lg px-2 py-1 -mx-2 transition-opacity ${
                hidden.has("deaths") ? "opacity-40" : "opacity-100"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                style={{ backgroundColor: CHART_COLORS.death }}
              />
              <span className="text-[10px] uppercase tracking-wider text-ink-faint">
                {t("charts.population.birthsDeaths.deaths")}
              </span>
              <AnimatedNumber
                value={row?.deaths ?? 0}
                size="sm"
                className="text-ink block mt-1"
              />
            </button>
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-4 tabular-nums">
          {t("charts.population.naturalDeficit.deathsPerBirth").replace("{ratio}", deathRatio)}
        </p>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-7">
        <div className="relative mx-[11px]">
          <div
            className="pressure-playhead absolute top-0 bottom-0 w-px pointer-events-none z-10"
            style={{ left: `${playheadPct * 100}%` }}
            aria-hidden
          />
          <div
            className="pressure-playhead-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent border-2 border-surface shadow-card z-10 pointer-events-none"
            style={{ left: `${playheadPct * 100}%` }}
            aria-hidden
          />

          <div className="relative h-[200px] sm:h-[220px] rounded-xl overflow-hidden bg-canvas/50 border border-border/60">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              role="img"
              aria-label={t("charts.population.naturalDeficit.gapLabel")}
            >
              <defs>
                <linearGradient id="deficit-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={CHART_COLORS.death} stopOpacity="0.35" />
                  <stop offset="55%" stopColor={CHART_COLORS.death} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={CHART_COLORS.birth} stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((pct) => (
                <line
                  key={pct}
                  x1={0}
                  y1={PAD_Y + (VIEW_H - PAD_Y * 2) * pct}
                  x2={VIEW_W}
                  y2={PAD_Y + (VIEW_H - PAD_Y * 2) * pct}
                  stroke="#E5E1DB"
                  strokeWidth="1"
                  strokeDasharray="5 4"
                />
              ))}

              {!hidden.has("births") && !hidden.has("deaths") && deficitPath && (
                <path d={deficitPath} fill="url(#deficit-fill)" />
              )}

              {!hidden.has("deaths") && (
                <polyline
                  points={deathPts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={CHART_COLORS.death}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {!hidden.has("births") && (
                <polyline
                  points={birthPts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={CHART_COLORS.birth}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {deathPts[yearIndex] && !hidden.has("deaths") && (
                <circle
                  cx={deathPts[yearIndex].x}
                  cy={deathPts[yearIndex].y}
                  r="5"
                  fill="#FAF9F7"
                  stroke={CHART_COLORS.death}
                  strokeWidth="2.5"
                />
              )}
              {birthPts[yearIndex] && !hidden.has("births") && (
                <circle
                  cx={birthPts[yearIndex].x}
                  cy={birthPts[yearIndex].y}
                  r="5"
                  fill="#FAF9F7"
                  stroke={CHART_COLORS.birth}
                  strokeWidth="2.5"
                />
              )}
            </svg>

            <div className="absolute inset-0 flex">
              {years.map((y, i) => (
                <button
                  key={y}
                  type="button"
                  data-cursor-interactive
                  className="flex-1 h-full opacity-0 hover:opacity-100 focus:opacity-100 focus:outline-none transition-opacity"
                  aria-label={`${y}`}
                  onClick={() => handleColumnClick(i)}
                >
                  <span
                    className={`block h-full mx-px rounded-sm transition-colors ${
                      y === safeYear ? "bg-accent/10" : "bg-accent/0 hover:bg-accent/5"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-2 px-0.5 text-[10px] text-ink-faint tabular-nums">
            <span>{formatNumber(Math.round(yMin))}</span>
            <span className="uppercase tracking-wider">
              {t("charts.population.naturalDeficit.gapLabel")}
            </span>
            <span>{formatNumber(Math.round(yMax))}</span>
          </div>
        </div>

        <div className="mt-7 px-1">
          <p className="text-xs text-ink-faint mb-2">
            {t("charts.population.naturalDeficit.slideYears")}
          </p>
          <YearSlider years={years} value={safeYear} onChange={setYear} />
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-border/80 bg-canvas/35">
        <p className="text-sm text-ink leading-relaxed">{insight}</p>
        <p className="text-xs text-ink-muted mt-2">{t("charts.population.naturalDeficit.everyYear")}</p>
      </div>
    </div>
  );
}
