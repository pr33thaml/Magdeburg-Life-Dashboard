"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DashboardData, LensId } from "@/lib/types";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";
import { RISK_MAP_COLORS } from "@/lib/risk-styles";
import { LENS_IDS, accessLensByDistrict } from "@/lib/access-lens";
import { DistrictPanel } from "./DistrictPanel";
import { MapContainer } from "./MapContainer";
import { LensFilterDeck } from "./LensFilterDeck";
import { CompoundAccessIndex } from "./CompoundAccessIndex";

type MapView = "tripleLens" | "priority" | "hospitals";

interface HealthcareMapProps {
  data: DashboardData["healthcare"];
  riskDistricts?: DashboardData["riskDistricts"];
}

export function HealthcareMap({ data, riskDistricts = [] }: HealthcareMapProps) {
  const t = useTranslations();
  const { formatDecimal, formatNumber } = useFormatNumber();
  const [mapView, setMapView] = useState<MapView>("tripleLens");
  const [activeLenses, setActiveLenses] = useState<Set<LensId>>(
    () => new Set(LENS_IDS)
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);

  const accessLens = data.accessLens;
  const lensByDistrict = useMemo(
    () => (accessLens ? accessLensByDistrict(accessLens.districts) : new Map()),
    [accessLens]
  );

  const districts = data.districtSummary;
  const maxRatio = Math.max(...districts.map((d) => d.ratioPer1000), 1);

  const toggleLens = (lens: LensId) => {
    setActiveLenses((prev) => {
      const next = new Set(prev);
      if (next.has(lens)) {
        if (next.size > 1) next.delete(lens);
      } else {
        next.add(lens);
      }
      return next;
    });
  };

  const selectedSummary = useMemo(
    () => districts.find((d) => d.district === selectedDistrict) ?? null,
    [districts, selectedDistrict]
  );

  const selectedRisk = useMemo(
    () => riskDistricts.find((d) => d.district === selectedDistrict),
    [riskDistricts, selectedDistrict]
  );

  const selectedLens = selectedDistrict ? lensByDistrict.get(selectedDistrict) : undefined;

  const handleSelect = (name: string, force = false) => {
    setSelectedDistrict((prev) => {
      if (force) return name;
      return prev === name ? null : name;
    });
  };

  const scrollToBreakdown = useCallback(() => {
    breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleIndexSelect = useCallback(
    (name: string) => {
      setSelectedDistrict(name);
      requestAnimationFrame(() => scrollToBreakdown());
    },
    [scrollToBreakdown]
  );

  const viewButton = (id: MapView, label: string) => (
    <button
      type="button"
      data-cursor-interactive
      onClick={() => setMapView(id)}
      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
        mapView === id
          ? "bg-accent text-white border-accent"
          : "bg-surface text-ink-muted border-border hover:border-border-strong hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="card p-3 sm:p-4 md:p-6 overflow-hidden">
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted mb-1">
            {t("map.lens.eyebrow")}
          </p>
          <h3 className="font-serif text-xl text-ink">{t("map.lens.title")}</h3>
          <p className="text-sm text-ink-muted mt-1 max-w-2xl">{t("map.lens.lead")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {viewButton("tripleLens", t("map.lens.tripleLens"))}
          {viewButton("priority", t("map.districtAccess"))}
          {viewButton("hospitals", t("map.hospitals"))}
        </div>

        {mapView === "tripleLens" && accessLens && (
          <div className="mb-5 space-y-4">
            <LensFilterDeck activeLenses={activeLenses} onToggle={toggleLens} />

            <p className="text-[11px] text-ink-faint">
              {t("map.lens.meta")
                .replace("{stops}", formatNumber(accessLens.magdeburgBusStops))
                .replace("{radius}", formatDecimal(accessLens.busStopRadiusKm, 1))}
            </p>
          </div>
        )}

        {mapView === "priority" && (
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_MAP_COLORS.Low }} />
              {t("risk.levels.Low")} {t("map.riskLabel")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_MAP_COLORS.Medium }} />
              {t("risk.levels.Medium")} {t("map.riskLabel")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_MAP_COLORS.High }} />
              {t("risk.levels.High")} {t("map.riskLabel")}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MapContainer
              facilities={data.facilities}
              selectedDistrict={selectedDistrict}
              districts={districts}
              riskDistricts={riskDistricts}
              accessLens={accessLens}
              mapView={mapView}
              activeLenses={activeLenses}
              showHospitals={mapView === "hospitals"}
              onDistrictClick={handleSelect}
              onClearSelection={() => setSelectedDistrict(null)}
            />
          </div>
          <div
            ref={breakdownRef}
            id="district-breakdown"
            className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start scroll-mt-24"
          >
            <DistrictPanel
              district={selectedSummary}
              risk={selectedRisk}
              lens={selectedLens}
              activeLenses={activeLenses}
              showLens={mapView === "tripleLens"}
              busStopRadiusKm={accessLens?.busStopRadiusKm}
              magdeburgBusStops={accessLens?.magdeburgBusStops}
            />
          </div>
        </div>
      </div>

      {mapView === "tripleLens" && accessLens ? (
        <CompoundAccessIndex
          districts={districts}
          lensByDistrict={lensByDistrict}
          activeLenses={activeLenses}
          selectedDistrict={selectedDistrict}
          onSelect={handleIndexSelect}
          footnote={data.excludedDistrictsNote}
        />
      ) : (
        <div className="card p-6 md:p-8">
          <h3 className="font-sans text-sm font-medium text-ink mb-1">{t("map.ranking.title")}</h3>
          <p className="text-xs text-ink-muted mb-5">{t("map.ranking.hint")}</p>

          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
            {[...districts]
              .sort((a, b) => a.ratioPer1000 - b.ratioPer1000)
              .map((district) => (
                <button
                  key={district.district}
                  type="button"
                  data-cursor-interactive
                  onClick={() => handleSelect(district.district)}
                  className={`w-full flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-3 rounded-md text-left transition-all ${
                    selectedDistrict === district.district
                      ? "bg-accent-muted ring-1 ring-accent/30"
                      : "hover:bg-canvas"
                  }`}
                >
                  <span className="text-sm font-medium text-ink w-24 sm:w-32 shrink-0 truncate">
                    {district.district}
                  </span>
                  <div className="flex-1 h-2 bg-canvas rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{ width: `${(district.ratioPer1000 / maxRatio) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-ink-muted w-12 text-right tabular-nums">
                    {formatDecimal(district.ratioPer1000, 2)}
                  </span>
                </button>
              ))}
          </div>

          <p className="text-xs text-ink-faint mt-4 pt-4 border-t border-border">
            {data.excludedDistrictsNote}
          </p>
        </div>
      )}
    </div>
  );
}

export default HealthcareMap;
