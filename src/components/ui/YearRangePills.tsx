"use client";

import type { YearRange } from "@/lib/chart-utils";
import { YEAR_RANGES } from "@/lib/chart-utils";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface YearRangePillsProps {
  value: YearRange;
  onChange: (range: YearRange) => void;
}

export function YearRangePills({ value, onChange }: YearRangePillsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-thin">
      {YEAR_RANGES.map((range) => (
        <button
          key={range.id}
          type="button"
          data-cursor-interactive
          onClick={() => onChange(range.id)}
          className={`shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all whitespace-nowrap ${
            value === range.id
              ? "bg-accent text-white border-accent shadow-sm"
              : "bg-canvas text-ink-muted border-border hover:border-border-strong hover:text-ink"
          }`}
        >
          {t(`yearRange.${range.id}`)}
        </button>
      ))}
    </div>
  );
}
