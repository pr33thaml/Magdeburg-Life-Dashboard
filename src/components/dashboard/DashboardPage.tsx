"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/layout/Section";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/overview/Hero";
import { KpiGrid } from "@/components/overview/KpiGrid";
import { PopulationSection } from "@/components/population/PopulationSection";
import { EmergencySection } from "@/components/emergency/EmergencySection";
import { HealthcareMapLoader } from "@/components/healthcare/HealthcareMapLoader";
import { InsightsSection } from "@/components/insights/InsightsSection";
import { NarrativeBridge } from "@/components/narrative/NarrativeBridge";
import { SectionConclusion } from "@/components/ui/SectionConclusion";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeDashboardData } from "@/lib/i18n/localize-data";
import type { DashboardData } from "@/lib/types";

interface DashboardPageProps {
  data: DashboardData;
}

export function DashboardPage({ data }: DashboardPageProps) {
  const { t } = useLocale();
  const localized = useMemo(() => localizeDashboardData(data, t), [data, t]);

  return (
    <>
      <Header />
      <main>
        <Hero />

        <Section
          id="overview"
          eyebrow={t("sections.overview.eyebrow")}
          title={t("sections.overview.title")}
          lead={t("sections.overview.lead")}
        >
          <KpiGrid metrics={localized.overview} />
        </Section>

        <NarrativeBridge text={t("bridges.migration")} />

        <Section
          id="population"
          eyebrow={t("sections.population.eyebrow")}
          title={t("sections.population.title")}
          lead={t("sections.population.lead")}
        >
          <SectionConclusion text={localized.narratives.population} />
          <PopulationSection data={localized.population} />
        </Section>

        <NarrativeBridge text={t("bridges.aging")} />

        <Section
          id="emergency"
          eyebrow={t("sections.emergency.eyebrow")}
          title={t("sections.emergency.title")}
          lead={t("sections.emergency.lead")}
        >
          <SectionConclusion text={localized.narratives.emergency} />
          <EmergencySection data={localized.emergency} />
        </Section>

        <NarrativeBridge text={t("bridges.access")} />

        <Section
          id="healthcare"
          eyebrow={t("sections.healthcare.eyebrow")}
          title={t("sections.healthcare.title")}
          lead={t("sections.healthcare.lead")}
        >
          <SectionConclusion text={localized.narratives.healthcare} />
          <HealthcareMapLoader
            data={localized.healthcare}
            riskDistricts={localized.riskDistricts}
          />
        </Section>

        <NarrativeBridge text={t("bridges.pattern")} />

        <Section
          id="insights"
          eyebrow={t("sections.insights.eyebrow")}
          title={t("sections.insights.title")}
          lead={t("sections.insights.lead")}
          className="pb-24"
        >
          <SectionConclusion text={localized.narratives.insights} />
          <InsightsSection
            insights={localized.insights}
            population={localized.population}
            emergency={localized.emergency}
            districts={localized.healthcare.districtSummary}
          />
        </Section>
      </main>
      <Footer
        dataSource={data.meta.dataSource}
        lastUpdated={data.meta.lastUpdated}
      />
    </>
  );
}
