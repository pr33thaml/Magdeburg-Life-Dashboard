import type { AccessLensDistrict, DistrictSummary, LensId } from "@/lib/types";
import { lensLevelFor, LENS_IDS } from "@/lib/access-lens";

export interface LensNote {
  id: LensId;
  level: string;
  value: string;
  body: string;
}

export function buildLensNotes(
  lens: AccessLensDistrict,
  district: DistrictSummary,
  activeLenses: Set<LensId>,
  t: (key: string) => string,
  formatNumber: (n: number) => string,
  formatDecimal: (n: number, digits?: number) => string,
  busStopRadiusKm: number,
  magdeburgBusStops: number
): LensNote[] {
  return LENS_IDS.filter((id) => activeLenses.has(id)).map((id) => {
    const level = lensLevelFor(lens, id);
    const value =
      id === "physicians"
        ? `${formatDecimal(lens.physiciansPer1000, 2)} / 1k`
        : id === "transport"
          ? `${formatDecimal(district.elderlyPct ?? 0, 1)}%`
          : `${formatNumber(lens.busStopsNearby)}`;

    const body = t(`map.gapExplainer.lens.${id}.${level}`)
      .replace("{value}", value)
      .replace("{district}", district.district)
      .replace("{radius}", formatDecimal(busStopRadiusKm, 1))
      .replace("{stops}", formatNumber(magdeburgBusStops));

    return { id, level, value, body };
  });
}
