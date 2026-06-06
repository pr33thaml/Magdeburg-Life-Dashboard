"use client";

import { useEffect, useMemo, useState } from "react";
import type { DistrictSummary } from "@/lib/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";

interface PhysicianGapCanvasProps {
  districts: DistrictSummary[];
}

export function PhysicianGapCanvas({ districts }: PhysicianGapCanvasProps) {
  const t = useTranslations();
  const { formatNumber, formatDecimal } = useFormatNumber();
  const [focus, setFocus] = useState<"low" | "high">("low");
  const [denseVisible, setDenseVisible] = useState(0);

  const { low, high, multiple } = useMemo(() => {
    const eligible = districts.filter(
      (d) => d.ratioPer1000 > 0 && d.physicianDataAvailable !== false
    );
    const sorted = [...eligible].sort((a, b) => a.ratioPer1000 - b.ratioPer1000);
    const lo = sorted[0];
    const hi = sorted[sorted.length - 1];
    const mult = lo && hi && lo.ratioPer1000 > 0 ? hi.ratioPer1000 / lo.ratioPer1000 : 33;
    return { low: lo, high: hi, multiple: mult };
  }, [districts]);

  const denseSlots = useMemo(
    () => Math.min(12, Math.max(4, Math.round(high?.ratioPer1000 ?? 13))),
    [high]
  );

  useEffect(() => {
    const focusTimer = window.setInterval(() => {
      setFocus((f) => (f === "low" ? "high" : "low"));
    }, 2800);
    return () => window.clearInterval(focusTimer);
  }, []);

  useEffect(() => {
    setDenseVisible(0);
    const timers: number[] = [];
    for (let i = 0; i < denseSlots; i++) {
      timers.push(
        window.setTimeout(() => setDenseVisible((n) => n + 1), 180 + i * 120)
      );
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [denseSlots, focus]);

  if (!low || !high) return null;

  return (
    <div
      className="care-contrast relative mt-1 mb-4 rounded-xl border border-border/70 bg-canvas/60 px-3 py-3 pointer-events-none select-none overflow-hidden"
      aria-hidden
    >
      <p className="text-[10px] uppercase tracking-wider text-ink-faint text-center mb-3">
        {t("charts.insights.physicianGap.sameCity")}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
        {/* Sparse district */}
        <div
          className={`care-contrast-panel rounded-lg border px-2 py-3 text-center transition-all duration-500 ${
            focus === "low"
              ? "care-contrast-panel--active border-[#B83A32]/40 bg-[#B83A32]/06"
              : "border-border/60 bg-surface/50 opacity-75"
          }`}
        >
          <span className="gap-callout-pill text-base px-2.5 py-1 block w-fit mx-auto scale-90">
            {low.district}
          </span>
          <div className="relative h-16 flex items-center justify-center my-2">
            <span className="care-contrast-lonely text-3xl" role="img" aria-hidden>
              🩺
            </span>
            <span className="care-contrast-lonely-ring absolute inset-0 m-auto w-12 h-12 rounded-full border-2 border-[#B83A32]/30" />
          </div>
          <p className="text-lg font-serif tabular-nums text-[#B83A32] leading-none">
            {formatDecimal(low.ratioPer1000, 2)}
          </p>
          <p className="text-[9px] text-ink-faint mt-1">
            {formatNumber(low.doctors)} {t("charts.insights.physicianGap.doctors")} ·{" "}
            {formatNumber(low.population)} pop.
          </p>
        </div>

        {/* Multiplier bridge */}
        <div className="flex flex-col items-center justify-center px-0.5 min-w-[3.25rem]">
          <div className="care-contrast-multiply font-serif text-xl text-accent tabular-nums leading-none">
            {formatDecimal(multiple, 0)}×
          </div>
          <svg width="20" height="32" viewBox="0 0 20 32" className="my-1 opacity-60" aria-hidden>
            <line x1="2" y1="16" x2="18" y2="8" stroke="#2D4A3E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
            <line x1="2" y1="16" x2="18" y2="24" stroke="#2D4A3E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
          </svg>
          <span className="text-[8px] uppercase tracking-wider text-ink-faint text-center leading-tight">
            {t("charts.insights.physicianGap.gap")}
          </span>
        </div>

        {/* Dense district */}
        <div
          className={`care-contrast-panel rounded-lg border px-2 py-3 text-center transition-all duration-500 ${
            focus === "high"
              ? "care-contrast-panel--active border-accent/40 bg-accent/06"
              : "border-border/60 bg-surface/50 opacity-75"
          }`}
        >
          <span className="gap-callout-pill text-base px-2.5 py-1 block w-fit mx-auto scale-90">
            {high.district}
          </span>
          <div className="grid grid-cols-4 gap-1 h-16 content-center my-2 px-1">
            {Array.from({ length: denseSlots }).map((_, i) => (
              <span
                key={i}
                className={`care-contrast-cell text-sm ${
                  i < denseVisible ? "care-contrast-cell--in" : "opacity-0"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
                role="img"
                aria-hidden
              >
                ➕
              </span>
            ))}
          </div>
          <p className="text-lg font-serif tabular-nums text-accent leading-none">
            {formatDecimal(high.ratioPer1000, 2)}
          </p>
          <p className="text-[9px] text-ink-faint mt-1">
            {formatNumber(high.doctors)} {t("charts.insights.physicianGap.doctors")} ·{" "}
            {formatNumber(high.population)} pop.
          </p>
        </div>
      </div>

      <p className="text-center text-[10px] text-ink-faint mt-2">
        {t("charts.insights.physicianGap.per1k")}
      </p>
    </div>
  );
}
