"use client";

import { useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { YearSlider } from "@/components/ui/YearSlider";
import { CHART_COLORS } from "@/lib/chart-theme";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export interface IndexedRow {
  year: number;
  emergencyIndex: number;
  ageIndex: number;
  doctorsIndex: number;
}

type MetricKey = "emergencyIndex" | "ageIndex" | "doctorsIndex";

interface MetricDef {
  key: MetricKey;
  label: string;
  color: string;
  glow: string;
}

const Y_MIN = 88;
const Y_MAX = 132;
const BASELINE = 100;
const VIEW_W = 1000;
const LANE_H = 72;

function svgNum(n: number): number {
  return Math.round(n * 100) / 100;
}

function indexToY(index: number): number {
  const t = (index - Y_MIN) / (Y_MAX - Y_MIN);
  return svgNum(LANE_H - t * LANE_H);
}

function baselineY(): number {
  return indexToY(BASELINE);
}

function pointsFor(data: IndexedRow[], key: MetricKey) {
  const n = data.length;
  return data.map((row, i) => ({
    x: svgNum(n <= 1 ? VIEW_W / 2 : (i / (n - 1)) * VIEW_W),
    y: indexToY(row[key]),
  }));
}

function linePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function areaPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  const base = baselineY();
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${linePath(pts)} L ${last.x} ${base} L ${first.x} ${base} Z`;
}

function toggleSet(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

interface IndexedPressureCanvasProps {
  data: IndexedRow[];
}

export function IndexedPressureCanvas({ data }: IndexedPressureCanvasProps) {
  const t = useTranslations();
  const years = useMemo(() => data.map((d) => d.year), [data]);
  const defaultYear = years[years.length - 1] ?? 2010;
  const [year, setYear] = useState(defaultYear);

  const metrics: MetricDef[] = useMemo(
    () => [
      {
        key: "emergencyIndex",
        label: t("charts.insights.emergency"),
        color: CHART_COLORS.accent,
        glow: "rgba(244, 184, 96, 0.35)",
      },
      {
        key: "ageIndex",
        label: t("charts.insights.avgAge"),
        color: CHART_COLORS.primary,
        glow: "rgba(61, 155, 130, 0.3)",
      },
      {
        key: "doctorsIndex",
        label: t("charts.insights.physicians"),
        color: CHART_COLORS.secondary,
        glow: "rgba(91, 159, 232, 0.35)",
      },
    ],
    [t]
  );

  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const row = data.find((d) => d.year === year) ?? data[data.length - 1];
  const yearIndex = Math.max(0, years.indexOf(year));
  const playheadPct = years.length > 1 ? yearIndex / (years.length - 1) : 0;

  const divergence = useMemo(() => {
    if (!row) return "";
    const phys = row.doctorsIndex - BASELINE;
    const emerg = row.emergencyIndex - BASELINE;
    const age = row.ageIndex - BASELINE;
    const lead =
      phys > emerg && phys > age
        ? t("charts.insights.divergencePhysicians")
        : emerg > phys && emerg > age
          ? t("charts.insights.divergenceEmergency")
          : t("charts.insights.divergenceAge");
    return lead
      .replace("{year}", String(year))
      .replace("{physicians}", String(row.doctorsIndex))
      .replace("{emergency}", String(row.emergencyIndex))
      .replace("{age}", String(row.ageIndex))
      .replace("{physiciansDelta}", phys >= 0 ? `+${phys}` : String(phys))
      .replace("{emergencyDelta}", emerg >= 0 ? `+${emerg}` : String(emerg))
      .replace("{ageDelta}", age >= 0 ? `+${age}` : String(age));
  }, [row, year, t]);

  return (
    <div className="pressure-canvas card overflow-hidden border-border" data-cursor-interactive>
      <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-7 pb-5 border-b border-border/80">
        <div className="pressure-canvas-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-2">
              {t("charts.insights.pressureEyebrow")}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-ink tracking-tight">
              {t("charts.insights.title")}
            </h3>
            <p className="text-sm text-ink-muted mt-2 max-w-lg leading-relaxed">
              {t("charts.insights.subtitle")}
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <p className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink tabular-nums leading-none">
              {year}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint mt-1.5">
              {t("charts.insights.baseline")} = {BASELINE}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative mx-[11px]">
          <div
            className="pressure-playhead absolute top-0 bottom-0 w-px pointer-events-none z-10"
            style={{ left: `calc((100% - 0px) * ${playheadPct})` }}
            aria-hidden
          />
          <div
            className="pressure-playhead-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent border-2 border-surface shadow-card z-10 pointer-events-none"
            style={{ left: `calc((100% - 0px) * ${playheadPct})` }}
            aria-hidden
          />

          <div className="space-y-5">
            {metrics.map((metric) => {
              const visible = !hidden.has(metric.key);
              const pts = pointsFor(data, metric.key);
              const value = row?.[metric.key] ?? BASELINE;
              const delta = value - BASELINE;

              const labelButton = (
                <button
                  type="button"
                  data-cursor-interactive
                  onClick={() => setHidden((p) => toggleSet(p, metric.key))}
                  className={`text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors min-w-0 ${
                    visible ? "hover:bg-canvas/80" : ""
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2 align-middle shrink-0"
                    style={{ backgroundColor: metric.color }}
                  />
                  <span className="text-xs font-medium text-ink-muted">{metric.label}</span>
                </button>
              );

              const valueBlock = (
                <div className="text-right tabular-nums shrink-0">
                  <AnimatedNumber value={value} size="sm" className="text-ink block leading-none" />
                  <p
                    className="text-[10px] font-medium mt-1"
                    style={{ color: delta >= 0 ? metric.color : "#9C9890" }}
                  >
                    {delta >= 0 ? `+${delta}` : delta}{" "}
                    <span className="hidden md:inline">{t("charts.insights.vsBaseline")}</span>
                  </p>
                </div>
              );

              return (
                <div
                  key={metric.key}
                  className={`transition-opacity duration-300 ${
                    visible ? "opacity-100" : "opacity-25"
                  }`}
                >
                  <div className="flex md:hidden items-center justify-between gap-3 mb-2">
                    {labelButton}
                    {valueBlock}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[9rem_1fr_5.5rem] gap-2 md:gap-5 items-center">
                    <div className="hidden md:block">{labelButton}</div>

                  <div className="relative h-[64px] sm:h-[72px] rounded-lg overflow-hidden bg-canvas/50 border border-border/60 min-w-0">
                    <svg
                      viewBox={`0 0 ${VIEW_W} ${LANE_H}`}
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient
                          id={`pressure-fill-${metric.key}`}
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor={metric.color} stopOpacity="0.45" />
                          <stop offset="100%" stopColor={metric.color} stopOpacity="0.04" />
                        </linearGradient>
                      </defs>
                      <line
                        x1={0}
                        y1={baselineY()}
                        x2={VIEW_W}
                        y2={baselineY()}
                        stroke="#E5E1DB"
                        strokeWidth="1"
                        strokeDasharray="6 5"
                      />
                      {visible && (
                        <>
                          <path
                            d={areaPath(pts)}
                            fill={`url(#pressure-fill-${metric.key})`}
                          />
                          <path
                            d={linePath(pts)}
                            fill="none"
                            stroke={metric.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          {pts[yearIndex] && (
                            <circle
                              cx={pts[yearIndex].x}
                              cy={pts[yearIndex].y}
                              r="5"
                              fill="#FAF9F7"
                              stroke={metric.color}
                              strokeWidth="2.5"
                              style={{ filter: `drop-shadow(0 0 6px ${metric.glow})` }}
                            />
                          )}
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="hidden md:block">{valueBlock}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 px-1">
          <p className="text-xs text-ink-faint mb-2">{t("charts.insights.slideYears")}</p>
          <YearSlider years={years} value={year} onChange={setYear} />
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-border/80 bg-canvas/35">
        <p className="text-sm text-ink leading-relaxed">
          <span className="font-medium tabular-nums">{year}</span>
          <span className="text-ink-faint mx-2">·</span>
          {divergence}
        </p>
      </div>
    </div>
  );
}
