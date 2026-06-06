"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface HealthcareMapLoaderProps {
  data: DashboardData["healthcare"];
  riskDistricts?: DashboardData["riskDistricts"];
}

function MapLoading() {
  const t = useTranslations();
  return (
    <div className="w-full h-[min(58vh,440px)] sm:h-[500px] md:h-[560px] bg-canvas rounded-lg flex items-center justify-center border border-border">
      <p className="text-sm text-ink-muted">{t("map.loading")}</p>
    </div>
  );
}

export function HealthcareMapLoader({ data, riskDistricts }: HealthcareMapLoaderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <MapLoading />;

  return <HealthcareMapClient data={data} riskDistricts={riskDistricts} />;
}

function HealthcareMapClient({ data, riskDistricts }: HealthcareMapLoaderProps) {
  const [MapComponent, setMapComponent] = useState<
    typeof import("./HealthcareMap").default | null
  >(null);

  useEffect(() => {
    let active = true;
    void import("./HealthcareMap").then((mod) => {
      if (active) setMapComponent(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!MapComponent) return <MapLoading />;

  return <MapComponent data={data} riskDistricts={riskDistricts} />;
}
