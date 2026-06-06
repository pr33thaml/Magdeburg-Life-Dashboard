"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DashboardData } from "@/lib/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { YearSlider } from "@/components/ui/YearSlider";
import { CHART_COLORS } from "@/lib/chart-theme";
import { UnderstandThisButton } from "@/components/ui/UnderstandThisButton";
import { CareIndexStrip } from "./CareIndexStrip";
import { ReactorExplainerSheet } from "./ReactorExplainerSheet";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";

const PLAY_MS = 2000;
const VIEW_W = 720;
const VIEW_H = 280;

function svgNum(n: number): number {
  return Math.round(n * 100) / 100;
}

interface YearRow {
  year: number;
  naturalChange: number;
  netMigration: number;
  population: number;
  popDelta: number;
  emergencyIndex: number;
  doctorsIndex: number;
  careGap: number;
}

interface MagdeburgBalanceReactorProps {
  population: DashboardData["population"];
  emergency: DashboardData["emergency"];
  combinedTimeline: DashboardData["insights"]["combinedTimeline"];
}

export function MagdeburgBalanceReactor({
  population,
  emergency,
  combinedTimeline,
}: MagdeburgBalanceReactorProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatNumber();
  const [year, setYear] = useState(population.growth[0]?.year ?? 2010);
  const [playing, setPlaying] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rows = useMemo((): YearRow[] => {
    const baseEmerg = emergency.timeline[0]?.total ?? 1;
    const baseDocs = combinedTimeline[0]?.doctorsPer1000 ?? 1;

    return population.growth.map((g, i) => {
      const bd = population.birthsDeaths.find((d) => d.year === g.year);
      const mig = population.migration.find((d) => d.year === g.year);
      const tl = combinedTimeline.find((d) => d.year === g.year);
      const emerg = emergency.timeline.find((d) => d.year === g.year);
      const naturalChange = bd?.naturalChange ?? 0;
      const netMigration = mig?.netMigration ?? 0;
      const yoyPop =
        i > 0 ? g.value - population.growth[i - 1].value : naturalChange + netMigration;
      const emergIdx = emerg ? Math.round((emerg.total / baseEmerg) * 100) : 100;
      const docIdx = tl ? Math.round((tl.doctorsPer1000 / baseDocs) * 100) : 100;

      return {
        year: g.year,
        naturalChange,
        netMigration,
        population: g.value,
        popDelta: yoyPop,
        emergencyIndex: emergIdx,
        doctorsIndex: docIdx,
        careGap: docIdx - emergIdx,
      };
    });
  }, [population, emergency, combinedTimeline]);

  const years = useMemo(() => rows.map((r) => r.year), [rows]);
  const safeYear = years.includes(year) ? year : years[years.length - 1] ?? 2024;
  const row = rows.find((r) => r.year === safeYear) ?? rows[rows.length - 1];

  const balanceVisual = useMemo(() => {
    if (!row) {
      return { beamAngle: 0, leftWeight: 0, rightWeight: 0 };
    }
    const leftMag = Math.abs(row.naturalChange);
    const rightMag = Math.max(row.netMigration, 0);
    const yearScale = Math.max(leftMag, rightMag, 1);
    const leftWeight = leftMag / yearScale;
    const rightWeight = rightMag / yearScale;
    // Positive angle = left pan down; heavier side always dips.
    const beamAngle = svgNum(Math.max(-14, Math.min(14, (leftWeight - rightWeight) * 14)));

    return { beamAngle, leftWeight, rightWeight };
  }, [row]);

  const { beamAngle, leftWeight, rightWeight } = balanceVisual;

  const verdict = useMemo(() => {
    if (!row) return "";
    if (row.netMigration < 0) {
      return t("charts.insights.reactor.verdictOutflow")
        .replace("{year}", String(safeYear))
        .replace("{net}", formatNumber(row.netMigration))
        .replace("{pop}", formatNumber(row.population));
    }
    if (row.careGap < -5) {
      return t("charts.insights.reactor.verdictCareDemand")
        .replace("{year}", String(safeYear))
        .replace("{emerg}", String(row.emergencyIndex))
        .replace("{docs}", String(row.doctorsIndex))
        .replace("{gap}", String(Math.abs(row.careGap)));
    }
    return t("charts.insights.reactor.verdictGrowth")
      .replace("{year}", String(safeYear))
      .replace("{natural}", formatNumber(row.naturalChange))
      .replace("{migration}", formatNumber(row.netMigration))
      .replace("{popDelta}", formatNumber(row.popDelta));
  }, [row, safeYear, t, formatNumber]);

  const stopPlay = useCallback(() => {
    if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }
    setPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    stopPlay();
    setPlaying(true);
    playRef.current = setInterval(() => {
      setYear((prev) => {
        const idx = years.indexOf(prev);
        const next = idx < 0 ? 0 : idx + 1;
        if (next >= years.length) {
          stopPlay();
          return years[years.length - 1] ?? prev;
        }
        return years[next] ?? prev;
      });
    }, PLAY_MS);
  }, [years, stopPlay]);

  useEffect(() => () => stopPlay(), [stopPlay]);

  return (
    <div
      className={`balance-reactor card overflow-hidden border-border ${playing ? "balance-reactor--playing" : ""}`}
      data-cursor-interactive
    >
      <div className="relative px-4 sm:px-6 md:px-8 pt-6 sm:pt-7 pb-5 border-b border-border/80">
        <div className="balance-reactor-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-2">
              {t("charts.insights.reactor.eyebrow")}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-ink tracking-tight leading-tight">
              {t("charts.insights.reactor.title")}
            </h3>
            <p className="text-sm text-ink-muted mt-2 max-w-xl leading-relaxed">
              {t("charts.insights.reactor.subtitle")}
            </p>
            <UnderstandThisButton
              label={t("charts.insights.reactor.explainer.open")}
              onClick={() => setExplainerOpen(true)}
              className="mt-3 self-start"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              data-cursor-interactive
              onClick={() => (playing ? stopPlay() : startPlay())}
              className={`balance-reactor-play flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                playing
                  ? "bg-accent text-white border-accent shadow-card"
                  : "bg-surface text-ink border-border hover:border-accent/40 hover:text-accent"
              }`}
            >
              <span className={`balance-reactor-play-icon ${playing ? "balance-reactor-play-icon--active" : ""}`}>
                {playing ? "❚❚" : "▶"}
              </span>
              {playing ? t("charts.insights.reactor.pause") : t("charts.insights.reactor.play")}
            </button>
            <div className="text-right">
              <p className="font-serif text-3xl sm:text-4xl text-ink tabular-nums leading-none">{safeYear}</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-faint mt-1">
                {t("charts.insights.reactor.scrubHint")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-b border-border/60 bg-canvas/20">
        {[
          {
            key: "natural",
            label: t("dependency.naturalChange"),
            value: row?.naturalChange ?? 0,
            color: CHART_COLORS.death,
          },
          {
            key: "migration",
            label: t("dependency.netMigration"),
            value: row?.netMigration ?? 0,
            color: CHART_COLORS.migrationIn,
          },
          {
            key: "popDelta",
            label: t("charts.insights.reactor.popDelta"),
            value: row?.popDelta ?? 0,
            color: CHART_COLORS.primary,
          },
          {
            key: "population",
            label: t("charts.population.growth.label"),
            value: row?.population ?? 0,
            color: CHART_COLORS.secondary,
          },
        ].map((stat) => (
          <div
            key={stat.key}
            className="rounded-xl border border-border/70 bg-surface/80 px-3 sm:px-4 py-3 sm:py-4 transition-shadow hover:shadow-soft"
          >
            <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1 truncate">{stat.label}</p>
            <AnimatedNumber
              value={stat.value}
              size="sm"
              className={`block leading-none ${
                stat.key === "natural" ? "text-[#B83A32]" : "text-ink"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="px-4 md:px-8 py-6 md:py-8">
        <div className="balance-reactor-stage rounded-2xl border border-border/70 bg-canvas/40 p-4 sm:p-6">
            <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-4">
              {t("charts.insights.reactor.balanceLabel")}
            </p>
            <div className="relative mx-auto max-w-lg">
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full h-auto balance-reactor-svg"
                role="img"
                aria-label={t("charts.insights.reactor.balanceLabel")}
              >
                <defs>
                  <linearGradient id="reactor-left-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={CHART_COLORS.death} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={CHART_COLORS.death} stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="reactor-right-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={CHART_COLORS.migrationIn} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={CHART_COLORS.migrationIn} stopOpacity="0.12" />
                  </linearGradient>
                </defs>

                {(() => {
                  const pivotX = VIEW_W / 2;
                  const pivotY = 200;
                  const arm = 200;
                  const rad = (beamAngle * Math.PI) / 180;
                  const leftPanX = svgNum(pivotX - arm * Math.cos(rad));
                  const leftPanY = svgNum(pivotY + arm * Math.sin(rad));
                  const rightPanX = svgNum(pivotX + arm * Math.cos(rad));
                  const rightPanY = svgNum(pivotY - arm * Math.sin(rad));
                  const leftR = svgNum(16 + leftWeight * 36);
                  const rightR = svgNum(16 + rightWeight * 36);

                  return (
                    <>
                      <line x1={pivotX} y1={pivotY} x2={pivotX} y2={248} stroke="#C8C4BC" strokeWidth="3" />
                      <polygon
                        points={`${pivotX - 18},248 ${pivotX + 18},248 ${pivotX},268`}
                        fill="#D8D4CC"
                      />

                      <line
                        x1={leftPanX}
                        y1={leftPanY}
                        x2={rightPanX}
                        y2={rightPanY}
                        stroke="#2D4A3E"
                        strokeWidth="5"
                        strokeLinecap="round"
                        className="balance-reactor-beam"
                      />
                      <rect x={pivotX - 4} y={pivotY - 8} width={8} height={16} rx={2} fill="#2D4A3E" />

                      <line x1={leftPanX} y1={leftPanY} x2={leftPanX} y2={leftPanY - 28} stroke="#9C9890" strokeWidth="2" />
                      <ellipse cx={leftPanX} cy={leftPanY - 32} rx={48} ry={9} fill="#E5E1DB" stroke="#C8C4BC" strokeWidth="1.5" />
                      <circle
                        cx={leftPanX}
                        cy={svgNum(leftPanY - 32 - leftR - 4)}
                        r={leftR}
                        fill="url(#reactor-left-fill)"
                        stroke={CHART_COLORS.death}
                        strokeWidth="1.5"
                        className="balance-reactor-weight"
                      />

                      <line x1={rightPanX} y1={rightPanY} x2={rightPanX} y2={rightPanY - 28} stroke="#9C9890" strokeWidth="2" />
                      <ellipse cx={rightPanX} cy={rightPanY - 32} rx={48} ry={9} fill="#E5E1DB" stroke="#C8C4BC" strokeWidth="1.5" />
                      <circle
                        cx={rightPanX}
                        cy={svgNum(rightPanY - 32 - rightR - 4)}
                        r={rightR}
                        fill="url(#reactor-right-fill)"
                        stroke={CHART_COLORS.migrationIn}
                        strokeWidth="1.5"
                        className="balance-reactor-weight"
                      />

                      {playing &&
                        [0, 1, 2].map((i) => (
                          <circle
                            key={i}
                            r="4"
                            fill={CHART_COLORS.migrationIn}
                            className="balance-reactor-particle"
                            style={{ animationDelay: `${i * 0.55}s` }}
                          >
                            <animateMotion
                              dur="2.2s"
                              repeatCount="indefinite"
                              begin={`${i * 0.55}s`}
                              path={`M ${leftPanX} ${leftPanY} Q ${pivotX} ${pivotY - 40} ${rightPanX} ${rightPanY}`}
                            />
                          </circle>
                        ))}
                    </>
                  );
                })()}
              </svg>

              <div className="flex justify-between mt-2 text-xs text-ink-muted">
                <span>{t("dependency.flowNatural")}</span>
                <span>{t("dependency.flowGain")}</span>
              </div>
            </div>

            <CareIndexStrip
              emergencyIndex={row?.emergencyIndex ?? 100}
              doctorsIndex={row?.doctorsIndex ?? 100}
              careGap={row?.careGap ?? 0}
            />
        </div>

        <div className="mt-8 px-1">
          <YearSlider years={years} value={safeYear} onChange={(y) => { stopPlay(); setYear(y); }} />
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-border/80 bg-canvas/35">
        <p className="text-sm sm:text-base text-ink leading-relaxed balance-reactor-verdict">{verdict}</p>
      </div>

      <ReactorExplainerSheet
        open={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        context={{
          year: safeYear,
          naturalChange: row?.naturalChange ?? 0,
          netMigration: row?.netMigration ?? 0,
          popDelta: row?.popDelta ?? 0,
          population: row?.population ?? 0,
          emergencyIndex: row?.emergencyIndex ?? 100,
          doctorsIndex: row?.doctorsIndex ?? 100,
          careGap: row?.careGap ?? 0,
        }}
      />
    </div>
  );
}
