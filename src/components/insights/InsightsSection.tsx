"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { AgingCommunityCanvas } from "./AgingCommunityCanvas";
import { AmbulanceLane } from "./AmbulanceLane";
import { CitizenArrivalCanvas } from "./CitizenArrivalCanvas";
import { MagdeburgBalanceReactor } from "./MagdeburgBalanceReactor";
import { PhysicianGapCanvas } from "./PhysicianGapCanvas";

interface InsightsSectionProps {
  insights: DashboardData["insights"];
  population: DashboardData["population"];
  emergency: DashboardData["emergency"];
  districts: DashboardData["healthcare"]["districtSummary"];
}

export function InsightsSection({
  insights,
  population,
  emergency,
  districts,
}: InsightsSectionProps) {
  const t = useTranslations();
  const [activeFinding, setActiveFinding] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-sans text-sm font-medium text-ink">{t("charts.insights.keyFindings")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.keyFindings.map((finding, index) => (
            <button
              key={finding.id}
              type="button"
              data-cursor-interactive
              onClick={() =>
                setActiveFinding((prev) => (prev === index ? null : index))
              }
              className={`card p-4 sm:p-6 md:p-8 text-left transition-all hover:shadow-elevated ${
                activeFinding === index
                  ? "ring-2 ring-accent/30 border-accent/40"
                  : ""
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-2">
                {t("charts.insights.finding")} {index + 1}
              </p>
              <h4 className="font-serif text-xl text-ink leading-snug mb-3">
                {finding.title}
              </h4>
              {finding.id === "finding-1" && <CitizenArrivalCanvas />}
              {finding.id === "finding-2" && <AmbulanceLane />}
              {finding.id === "finding-3" && <PhysicianGapCanvas districts={districts} />}
              {finding.id === "finding-4" && (
                <AgingCommunityCanvas timeline={insights.combinedTimeline} />
              )}
              <p className="text-sm text-ink-muted leading-relaxed">{finding.body}</p>
            </button>
          ))}
        </div>
      </div>

      <MagdeburgBalanceReactor
        population={population}
        emergency={emergency}
        combinedTimeline={insights.combinedTimeline}
      />
    </div>
  );
}
