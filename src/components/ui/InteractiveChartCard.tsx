"use client";

import { ReactNode } from "react";
import type { YearRange } from "@/lib/chart-utils";
import { YearRangePills } from "./YearRangePills";
import { SeriesToggle, type SeriesOption } from "./SeriesToggle";

interface InteractiveChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  yearRange?: YearRange;
  onYearRangeChange?: (range: YearRange) => void;
  series?: SeriesOption[];
  hiddenSeries?: Set<string>;
  onSeriesToggle?: (key: string) => void;
  footer?: ReactNode;
  explainLabel?: string;
  onExplain?: () => void;
}

export function InteractiveChartCard({
  title,
  subtitle,
  children,
  className = "",
  yearRange,
  onYearRangeChange,
  series,
  hiddenSeries,
  onSeriesToggle,
  footer,
  explainLabel,
  onExplain,
}: InteractiveChartCardProps) {
  return (
    <div className={`card p-4 sm:p-6 md:p-8 transition-shadow hover:shadow-elevated overflow-hidden ${className}`}>
      <div className="mb-5 flex flex-col gap-4">
        <div className="min-w-0">
          <h3 className="font-sans text-sm font-medium text-ink">{title}</h3>
          {subtitle && (
            <p className="text-xs text-ink-muted mt-1">{subtitle}</p>
          )}
        </div>
        {(onExplain || (yearRange !== undefined && onYearRangeChange)) && (
          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-2.5 pt-3 border-t border-border/60 ${
              onExplain && yearRange !== undefined ? "sm:justify-between" : "sm:justify-end"
            }`}
          >
            {onExplain && explainLabel && (
              <button
                type="button"
                data-cursor-interactive
                onClick={onExplain}
                className="self-start px-3 py-1.5 rounded-full text-xs font-medium border border-accent/30 text-accent bg-accent-muted/80 hover:bg-accent/10 transition-all hover:shadow-soft whitespace-nowrap"
              >
                {explainLabel}
              </button>
            )}
            {yearRange !== undefined && onYearRangeChange && (
              <YearRangePills value={yearRange} onChange={onYearRangeChange} />
            )}
          </div>
        )}
      </div>

      {series && hiddenSeries && onSeriesToggle && (
        <div className="mb-4">
          <SeriesToggle
            series={series}
            hidden={hiddenSeries}
            onToggle={onSeriesToggle}
          />
        </div>
      )}

      {children}
      {footer}
    </div>
  );
}
