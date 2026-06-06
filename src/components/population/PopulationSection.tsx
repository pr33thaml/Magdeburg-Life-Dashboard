"use client";

import { useMemo, useState } from "react";
import {
  PopulationExplainerSheet,
  type PopulationChartId,
  type PopulationExplainerContext,
} from "@/components/population/PopulationExplainerSheet";
import { buildPopulationContext } from "@/lib/population-explainer-context";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
} from "recharts";
import { NaturalDeficitCanvas } from "@/components/population/NaturalDeficitCanvas";
import { MigrationFlowCanvas } from "@/components/population/MigrationFlowCanvas";
import type { DashboardData } from "@/lib/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { InteractiveChartCard } from "@/components/ui/InteractiveChartCard";
import { ResponsiveChart } from "@/components/ui/ResponsiveChart";
import { CustomTooltip } from "@/components/ui/CustomTooltip";
import { ChartFocusPanel } from "@/components/ui/ChartFocusPanel";
import {
  CHART_COLORS,
  chartMargin,
  axisStyle,
  gridStyle,
  cursorStyle,
  chartAnimation,
  activeDotStyle,
} from "@/lib/chart-theme";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";
import {
  filterByRange,
  findByYear,
  pctDelta,
  type YearRange,
} from "@/lib/chart-utils";
interface PopulationSectionProps {
  data: DashboardData["population"];
}

export function PopulationSection({ data }: PopulationSectionProps) {
  const t = useTranslations();
  const { formatNumber, formatDecimal, locale } = useFormatNumber();
  const numberLocale = locale === "de" ? "de-DE" : "en-US";
  const [yearRange, setYearRange] = useState<YearRange>("all");
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [pinnedYear, setPinnedYear] = useState<number | null>(null);
  const [explainerChart, setExplainerChart] = useState<PopulationChartId | null>(null);
  const [explainerContext, setExplainerContext] = useState<PopulationExplainerContext>(() =>
    buildPopulationContext(data, data.growth[data.growth.length - 1]?.year ?? 2024)
  );
  const focusYear = pinnedYear ?? activeYear;

  const openExplainer = (chartId: PopulationChartId, year?: number) => {
    const y = year ?? focusYear ?? data.growth[data.growth.length - 1]?.year ?? 2024;
    setExplainerContext(buildPopulationContext(data, y));
    setExplainerChart(chartId);
  };

  const growth = useMemo(() => filterByRange(data.growth, yearRange), [data.growth, yearRange]);
  const averageAge = useMemo(() => filterByRange(data.averageAge, yearRange), [data.averageAge, yearRange]);

  const handleYearInteract = (year: number) => {
    setActiveYear(year);
    setPinnedYear((prev) => (prev === year ? null : year));
  };

  const growthFocus = findByYear(data.growth, focusYear);
  const growthPrev = growthFocus
    ? findByYear(data.growth, focusYear! - 1)
    : undefined;

  const chartEvents = {
    onMouseMove: (state: { activeLabel?: string | number }) => {
      if (state?.activeLabel) setActiveYear(Number(state.activeLabel));
    },
    onMouseLeave: () => {
      if (!pinnedYear) setActiveYear(null);
    },
    onClick: (state: { activeLabel?: string | number }) => {
      if (state?.activeLabel) handleYearInteract(Number(state.activeLabel));
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChartCard
          title={t("charts.population.growth.title")}
          subtitle={t("charts.population.growth.subtitle")}
          yearRange={yearRange}
          onYearRangeChange={setYearRange}
          explainLabel={t("charts.population.explainer.open")}
          onExplain={() => openExplainer("growth")}
          footer={
            <ChartFocusPanel
              year={focusYear}
              stats={
                growthFocus
                  ? [
                      {
                        label: t("charts.population.growth.label"),
                        value: formatNumber(growthFocus.value),
                        delta: growthPrev
                          ? pctDelta(growthFocus.value, growthPrev.value)
                          : undefined,
                        tone:
                          growthPrev && growthFocus.value > growthPrev.value
                            ? "up"
                            : "down",
                      },
                    ]
                  : []
              }
            />
          }
        >
          <ResponsiveChart size="lg">
              <AreaChart data={growth} margin={chartMargin} {...chartEvents}>
                <defs>
                  <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  domain={["dataMin - 5000", "dataMax + 2000"]}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={45}
                />
                <Tooltip
                  cursor={cursorStyle}
                  content={<CustomTooltip formatter={(v) => formatNumber(v)} numberLocale={numberLocale} />}
                />
                {focusYear && (
                  <ReferenceLine
                    x={focusYear}
                    stroke={CHART_COLORS.primary}
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Population"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.5}
                  fill="url(#popGradient)"
                  activeDot={activeDotStyle}
                  {...chartAnimation}
                />
                <Brush
                  dataKey="year"
                  height={22}
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.grid}
                  travellerWidth={8}
                />
              </AreaChart>
          </ResponsiveChart>
        </InteractiveChartCard>

        <InteractiveChartCard
          title={t("charts.population.age.title")}
          subtitle={t("charts.population.age.subtitle")}
          yearRange={yearRange}
          onYearRangeChange={setYearRange}
          explainLabel={t("charts.population.explainer.open")}
          onExplain={() => openExplainer("age")}
          footer={
            <ChartFocusPanel
              year={focusYear}
              stats={
                findByYear(data.averageAge, focusYear)
                  ? [
                      {
                        label: t("charts.population.age.label"),
                        value: `${formatDecimal(findByYear(data.averageAge, focusYear)!.value, 1)} yrs`,
                      },
                    ]
                  : []
              }
            />
          }
        >
          <ResponsiveChart size="lg">
              <LineChart data={averageAge} margin={chartMargin} {...chartEvents}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  domain={["dataMin - 0.8", "dataMax + 0.3"]}
                  tickFormatter={(v) => formatDecimal(v, 1)}
                  width={40}
                />
                <Tooltip
                  cursor={cursorStyle}
                  content={
                    <CustomTooltip
                      formatter={(v) => `${formatDecimal(v, 1)} years`}
                      numberLocale={numberLocale}
                    />
                  }
                />
                {focusYear && (
                  <ReferenceLine x={focusYear} stroke={CHART_COLORS.accent} strokeDasharray="4 4" />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Average Age"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART_COLORS.accent, strokeWidth: 0 }}
                  activeDot={activeDotStyle}
                  {...chartAnimation}
                />
              </LineChart>
          </ResponsiveChart>
        </InteractiveChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NaturalDeficitCanvas data={data.birthsDeaths} onExplain={openExplainer} />
        <MigrationFlowCanvas
          migration={data.migration}
          birthsDeaths={data.birthsDeaths}
          onExplain={openExplainer}
        />
      </div>

      {explainerChart && (
        <PopulationExplainerSheet
          open={explainerChart !== null}
          onClose={() => setExplainerChart(null)}
          chartId={explainerChart}
          context={explainerContext}
        />
      )}
    </div>
  );
}
