"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import type {
  AccessLensData,
  DistrictSummary,
  HealthcareFacility,
  LensId,
  RiskDistrict,
} from "@/lib/types";
import { RISK_MAP_COLORS } from "@/lib/risk-styles";
import { DISTRICT_CENTROIDS } from "@/lib/district-centroids";
import { MAP_ACCESS_COLORS } from "@/lib/chart-theme";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import {
  accessLensByDistrict,
  districtLensColor,
  gapFraction,
  isCompoundGap,
  weakActiveLensCount,
} from "@/lib/access-lens";
import { MapChrome } from "./MapChrome";
import { MapFloatingControls, type MapCommand } from "./MapFloatingControls";
import { LensPrism } from "./LensPrism";
import "leaflet/dist/leaflet.css";

const MAGDEBURG_CENTER: [number, number] = [52.131, 11.639];
const CITY_ZOOM = 12;
const HOSPITAL_COLOR = "#A65D2E";
const COMPOUND_COLOR = "#6B2D5C";

interface MapContainerProps {
  facilities: HealthcareFacility[];
  selectedDistrict?: string | null;
  districts: DistrictSummary[];
  riskDistricts?: RiskDistrict[];
  accessLens?: AccessLensData;
  mapView?: "tripleLens" | "priority" | "hospitals";
  activeLenses?: Set<LensId>;
  showHospitals?: boolean;
  onDistrictClick?: (district: string, force?: boolean) => void;
  onClearSelection?: () => void;
}

function accessColor(ratio: number, min: number, max: number): string {
  if (max <= min) return MAP_ACCESS_COLORS.high;
  const t = (ratio - min) / (max - min);
  if (t >= 0.66) return MAP_ACCESS_COLORS.high;
  if (t >= 0.33) return MAP_ACCESS_COLORS.medium;
  return MAP_ACCESS_COLORS.low;
}

function districtRadius(population: number, selected: boolean, compound: boolean): number {
  const base = 7 + Math.sqrt(population) / 50;
  if (compound) return base + 5;
  return selected ? base + 3 : base;
}

function MapAttribution() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPosition("bottomleft");
  }, [map]);
  return null;
}

export function MapContainer({
  facilities,
  selectedDistrict = null,
  districts,
  riskDistricts = [],
  accessLens,
  mapView = "priority",
  activeLenses = new Set(["physicians", "transport", "transit"]),
  showHospitals = false,
  onDistrictClick,
  onClearSelection,
}: MapContainerProps) {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [mapCommand, setMapCommand] = useState<MapCommand>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const riskByDistrict = useMemo(
    () => new Map(riskDistricts.map((r) => [r.district, r.riskLevel])),
    [riskDistricts]
  );

  const lensByDistrict = useMemo(
    () => (accessLens ? accessLensByDistrict(accessLens.districts) : new Map()),
    [accessLens]
  );

  const quickDistricts = useMemo(() => {
    if (!accessLens || mapView !== "tripleLens") return [];
    return [...accessLens.districts]
      .sort((a, b) => {
        const ca = isCompoundGap(a, activeLenses) ? 100 : weakActiveLensCount(a, activeLenses);
        const cb = isCompoundGap(b, activeLenses) ? 100 : weakActiveLensCount(b, activeLenses);
        return cb - ca;
      })
      .slice(0, 5)
      .map((d) => d.district);
  }, [accessLens, mapView, activeLenses]);

  const ratios = districts.map((d) => d.ratioPer1000);
  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);

  const districtColor = (district: DistrictSummary) => {
    if (mapView === "tripleLens") {
      const lens = lensByDistrict.get(district.district);
      if (lens) return districtLensColor(lens, activeLenses);
    }
    const riskLevel = riskByDistrict.get(district.district);
    if (riskLevel) return RISK_MAP_COLORS[riskLevel];
    return accessColor(district.ratioPer1000, minRatio, maxRatio);
  };

  const hospitals = useMemo(
    () => (showHospitals ? facilities.filter((f) => f.type === "facility") : []),
    [facilities, showHospitals]
  );

  const districtCentroids = districts.map((d) => ({
    ...d,
    coords: DISTRICT_CENTROIDS[d.districtCode] ?? null,
  }));

  const handleSelect = useCallback(
    (name: string, force = false) => onDistrictClick?.(name, force),
    [onDistrictClick]
  );

  const clearSelection = useCallback(() => {
    onClearSelection?.();
    setMapCommand({ type: "fit" });
  }, [onClearSelection]);

  if (!mounted) {
    return (
      <div className="map-stage map-stage--loading w-full h-[min(58vh,440px)] sm:h-[500px] md:h-[600px] rounded-xl sm:rounded-2xl border border-border bg-canvas flex items-center justify-center">
        <p className="text-sm text-ink-muted">{t("map.loading")}</p>
      </div>
    );
  }

  return (
    <div className="map-stage relative w-full h-[min(58vh,440px)] sm:h-[500px] md:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-elevated">
      <MapChrome
        districts={districts}
        selectedDistrict={selectedDistrict}
        quickDistricts={quickDistricts}
        mapView={mapView}
        onSelect={handleSelect}
        onClear={clearSelection}
        onFitAll={() => setMapCommand({ type: "fit" })}
        onZoom={(delta) => setMapCommand({ type: "zoom", delta })}
      />

      <div className="map-vignette pointer-events-none absolute inset-0 z-[450]" aria-hidden />

      <LeafletMap
        center={MAGDEBURG_CENTER}
        zoom={CITY_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false}
        className="map-leaflet h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <MapAttribution />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          pane="shadowPane"
        />

        <MapFloatingControls
          command={mapCommand}
          onCommandHandled={() => setMapCommand(null)}
          districts={districts}
          selectedDistrict={selectedDistrict}
        />

        {districtCentroids.map((d) => {
          if (!d.coords) return null;
          const isSelected = selectedDistrict === d.district;
          const isHovered = hoveredDistrict === d.district;
          const isDimmed =
            selectedDistrict !== null && !isSelected && hoveredDistrict !== d.district;
          const lens = lensByDistrict.get(d.district);
          const compound = lens ? isCompoundGap(lens, activeLenses) : false;
          const color = districtColor(d);
          const radius = districtRadius(d.population, isSelected, compound);
          const showLabel = isSelected || isHovered || compound;

          return (
            <Fragment key={`district-${d.districtCode}`}>
              {(isSelected || compound) && (
                <CircleMarker
                  center={d.coords}
                  radius={radius + (compound ? 10 : 7)}
                  pathOptions={{
                    color: compound ? COMPOUND_COLOR : "#181614",
                    fillColor: "transparent",
                    fillOpacity: 0,
                    weight: compound ? 2 : 1.5,
                    opacity: isDimmed ? 0.15 : compound ? 0.7 : 0.45,
                    dashArray: compound ? "4 6" : undefined,
                  }}
                  interactive={false}
                />
              )}

              <CircleMarker
                center={d.coords}
                radius={radius}
                pathOptions={{
                  color: isSelected ? "#181614" : compound ? COMPOUND_COLOR : color,
                  fillColor: color,
                  fillOpacity: isDimmed ? 0.12 : isSelected ? 0.88 : compound ? 0.72 : 0.58,
                  weight: isSelected ? 2.5 : compound ? 2.5 : 1.5,
                  opacity: isDimmed ? 0.2 : 1,
                }}
                eventHandlers={{
                  click: () => onDistrictClick?.(d.district),
                  mouseover: () => setHoveredDistrict(d.district),
                  mouseout: () => setHoveredDistrict((h) => (h === d.district ? null : h)),
                }}
              >
                {showLabel && (
                  <Tooltip
                    permanent={isSelected}
                    direction="top"
                    offset={[0, -radius - 4]}
                    className="map-district-tooltip"
                  >
                    <span className="font-medium text-xs">{d.district}</span>
                  </Tooltip>
                )}
              </CircleMarker>
            </Fragment>
          );
        })}

        {hospitals.map((facility) => {
          const isSelected =
            !selectedDistrict || facility.district === selectedDistrict;
          const isDimmed = selectedDistrict !== null && !isSelected;

          return (
            <CircleMarker
              key={facility.id}
              center={[facility.lat, facility.lng]}
              radius={isSelected ? 11 : 9}
              pathOptions={{
                color: "#FAF9F7",
                fillColor: HOSPITAL_COLOR,
                fillOpacity: isDimmed ? 0.25 : 0.95,
                weight: 2.5,
                opacity: isDimmed ? 0.35 : 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} className="map-district-tooltip">
                <span className="text-xs font-medium">{facility.name}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </LeafletMap>

      {selectedDistrict && (
        <div className="map-mobile-hint absolute bottom-14 left-3 right-3 z-[500] lg:hidden pointer-events-none">
          <div className="px-3 py-2 rounded-xl bg-surface/95 backdrop-blur-md border border-border text-xs text-ink-muted text-center shadow-card">
            {t("map.chrome.mobileHint")}
          </div>
        </div>
      )}

      {mapView === "tripleLens" && selectedDistrict && lensByDistrict.get(selectedDistrict) && (
        <div className="map-float-card absolute bottom-16 left-3 z-[480] hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-elevated pointer-events-none max-w-[220px]">
          <LensPrism
            district={lensByDistrict.get(selectedDistrict)!}
            activeLenses={activeLenses}
            size={36}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink truncate">{selectedDistrict}</p>
            <p className="text-[10px] text-ink-faint tabular-nums">
              {(() => {
                const lens = lensByDistrict.get(selectedDistrict)!;
                const g = gapFraction(lens, activeLenses);
                return `${g.weak}/${g.total} ${t("map.lens.gapShort")}`;
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
