"use client";

import type { KpiMetric } from "@/lib/types";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const KPI_SECTIONS: Record<string, string> = {
  population: "#population",
  births: "#population",
  deaths: "#population",
  emergency: "#emergency",
  doctors: "#healthcare",
  pharmacies: "#healthcare",
};

interface KpiGridProps {
  metrics: KpiMetric[];
}

export function KpiGrid({ metrics }: KpiGridProps) {
  const t = useTranslations();
  const { formatChange } = useFormatNumber();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {metrics.map((metric, index) => (
        <a
          key={metric.id}
          href={KPI_SECTIONS[metric.id] ?? "#overview"}
          className="card p-4 sm:p-6 md:p-8 animate-slide-up group transition-all hover:shadow-elevated hover:border-border-strong md:hover:-translate-y-0.5"
          style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-3 group-hover:text-ink transition-colors">
            {metric.label}
          </p>
          <AnimatedNumber
            value={metric.value}
            size="lg"
            className="text-ink tracking-tight block"
          />
          {metric.change !== undefined && (
            <p
              className={`text-sm mt-2 ${
                metric.change > 0
                  ? "text-signal-emergency"
                  : metric.change < 0
                    ? "text-signal-birth"
                    : "text-ink-muted"
              }`}
            >
              {formatChange(metric.change)}{" "}
              <span className="text-ink-faint">{metric.changeLabel}</span>
            </p>
          )}
          <p className="text-[10px] text-ink-faint mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {t("kpi.jumpTo")}
          </p>
        </a>
      ))}
    </div>
  );
}
