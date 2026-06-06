"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardData } from "@/lib/types";

type TimelinePoint = DashboardData["insights"]["combinedTimeline"][number];
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";

const ORBIT_ICONS = ["🏠", "🌳", "☕", "🤝", "📚", "💚"] as const;

interface AgingCommunityCanvasProps {
  timeline: TimelinePoint[];
}

export function AgingCommunityCanvas({ timeline }: AgingCommunityCanvasProps) {
  const t = useTranslations();
  const { formatDecimal } = useFormatNumber();
  const years = useMemo(() => timeline.map((d) => d.year), [timeline]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (years.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % years.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [years.length]);

  const point = timeline[index] ?? timeline[timeline.length - 1];
  const year = point?.year ?? 2024;
  const age = point?.averageAge ?? 45.2;

  return (
    <div
      className="aging-community relative mt-1 mb-4 rounded-xl border border-border/70 bg-canvas/60 px-3 py-4 pointer-events-none select-none overflow-hidden"
      aria-hidden
    >
      <p className="text-[10px] uppercase tracking-wider text-ink-faint text-center mb-3">
        {t("charts.insights.agingCommunity.live")}
      </p>

      <div className="relative mx-auto w-28 h-28">
        {ORBIT_ICONS.map((icon, i) => {
          const angle = (i / ORBIT_ICONS.length) * 360 + index * 14;
          return (
            <span
              key={icon}
              className="aging-orbit-icon absolute left-1/2 top-1/2 text-base"
              style={{
                transform: `rotate(${angle}deg) translateY(-46px) rotate(-${angle}deg)`,
              }}
            >
              {icon}
            </span>
          );
        })}

        <div className="aging-community-core absolute inset-0 m-auto w-16 h-16 rounded-full border-2 border-accent/30 bg-surface flex flex-col items-center justify-center shadow-card">
          <span key={age} className="aging-age-num font-serif text-xl text-ink tabular-nums leading-none">
            {formatDecimal(age, 1)}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-ink-faint mt-0.5">
            {t("charts.insights.agingCommunity.yrs")}
          </span>
        </div>

        <div className="aging-community-ring absolute inset-0 m-auto w-20 h-20 rounded-full border border-accent/20" />
      </div>

      <p className="text-center text-xs text-ink-muted mt-3 tabular-nums">
        {t("charts.insights.agingCommunity.year")}{" "}
        <span key={year} className="font-medium text-ink aging-year-num">
          {year}
        </span>
      </p>
    </div>
  );
}
