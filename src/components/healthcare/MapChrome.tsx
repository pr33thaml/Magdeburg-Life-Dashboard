"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { COMPOUND_GAP_COLOR, LENS_COLORS } from "@/lib/access-lens";
import { RISK_MAP_COLORS } from "@/lib/risk-styles";

interface MapChromeProps {
  districts: { district: string }[];
  selectedDistrict: string | null;
  quickDistricts: string[];
  mapView: "tripleLens" | "priority" | "hospitals";
  onSelect: (name: string, force?: boolean) => void;
  onClear: () => void;
  onFitAll: () => void;
  onZoom: (delta: number) => void;
}

export function MapChrome({
  districts,
  selectedDistrict,
  quickDistricts,
  mapView,
  onSelect,
  onClear,
  onFitAll,
  onZoom,
}: MapChromeProps) {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return districts
      .map((d) => d.district)
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [districts, query]);

  const pick = (name: string) => {
    onSelect(name, true);
    setQuery("");
    setOpen(false);
  };

  return (
    <>
      <div className="map-chrome-top absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-[500] flex flex-col sm:flex-row flex-wrap gap-2 pointer-events-none">
        <div className="map-chrome-search pointer-events-auto flex-1 min-w-0 w-full sm:min-w-[200px] sm:max-w-md relative">
          <label htmlFor="district-map-search" className="sr-only">
            {t("map.chrome.search")}
          </label>
          <input
            id="district-map-search"
            type="search"
            data-cursor-interactive
            value={query}
            placeholder={t("map.chrome.searchPlaceholder")}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-border/80 bg-surface/95 backdrop-blur-md shadow-card text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16 16" />
          </svg>

          {open && filtered.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 py-1 rounded-xl border border-border bg-surface/98 backdrop-blur-md shadow-elevated overflow-hidden z-10">
              {filtered.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    data-cursor-interactive
                    className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-canvas transition-colors"
                    onMouseDown={() => pick(name)}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedDistrict && (
          <div className="map-chrome-selection pointer-events-auto flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border border-accent/30 bg-surface/95 backdrop-blur-md shadow-card">
            <span className="text-xs text-ink-muted hidden sm:inline">{t("map.chrome.viewing")}</span>
            <span className="text-sm font-medium text-ink max-w-[140px] truncate">{selectedDistrict}</span>
            <button
              type="button"
              data-cursor-interactive
              onClick={onClear}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-faint hover:bg-canvas hover:text-ink transition-colors"
              aria-label={t("map.chrome.clear")}
            >
              ×
            </button>
          </div>
        )}

        {mapView === "tripleLens" && (
          <div className="map-chrome-legend-mobile pointer-events-none flex md:hidden flex-wrap gap-1.5 w-full">
            <span className="inline-flex items-center gap-1 text-[9px] text-ink-muted bg-surface/90 px-2 py-1 rounded-full border border-border/60">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COMPOUND_GAP_COLOR }} />
              {t("map.lens.tripleGap")}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-ink-muted bg-surface/90 px-2 py-1 rounded-full border border-border/60">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LENS_COLORS.weak }} />
              {t("map.lens.weak")}
            </span>
          </div>
        )}
      </div>

      <div className="map-chrome-controls absolute bottom-3 right-3 z-[500] flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          data-cursor-interactive
          onClick={() => onZoom(1)}
          className="map-chrome-btn w-9 h-9 rounded-lg border border-border/80 bg-surface/95 backdrop-blur-md shadow-card text-ink hover:bg-canvas transition-colors text-lg leading-none"
          aria-label={t("map.chrome.zoomIn")}
        >
          +
        </button>
        <button
          type="button"
          data-cursor-interactive
          onClick={() => onZoom(-1)}
          className="map-chrome-btn w-9 h-9 rounded-lg border border-border/80 bg-surface/95 backdrop-blur-md shadow-card text-ink hover:bg-canvas transition-colors text-lg leading-none"
          aria-label={t("map.chrome.zoomOut")}
        >
          −
        </button>
        <button
          type="button"
          data-cursor-interactive
          onClick={onFitAll}
          className="map-chrome-btn px-2.5 h-9 rounded-lg border border-border/80 bg-surface/95 backdrop-blur-md shadow-card text-[10px] font-medium uppercase tracking-wider text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
        >
          {t("map.chrome.fit")}
        </button>
      </div>

      {quickDistricts.length > 0 && mapView === "tripleLens" && (
        <div className="map-chrome-quick absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-12 sm:right-14 z-[500] pointer-events-auto overflow-x-auto max-w-[calc(100%-3rem)]">
          <div className="flex gap-1.5 pb-0.5">
            <span className="shrink-0 self-center text-[9px] font-medium uppercase tracking-wider text-ink-faint px-1">
              {t("map.chrome.jump")}
            </span>
            {quickDistricts.map((name) => (
              <button
                key={name}
                type="button"
                data-cursor-interactive
                onClick={() => onSelect(name)}
                className={`shrink-0 px-2.5 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  selectedDistrict === name
                    ? "bg-accent text-white border-accent"
                    : "bg-surface/95 backdrop-blur-md border-border text-ink-muted hover:text-ink hover:border-border-strong"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="map-chrome-legend absolute bottom-16 right-3 z-[400] pointer-events-none hidden md:block">
        <div className="px-3 py-2 rounded-xl border border-border/60 bg-surface/90 backdrop-blur-sm shadow-card text-[10px] text-ink-muted space-y-1.5 max-w-[140px]">
          {mapView === "tripleLens" ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COMPOUND_GAP_COLOR }} />
                {t("map.lens.tripleGap")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LENS_COLORS.weak }} />
                {t("map.lens.weak")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LENS_COLORS.strong }} />
                {t("map.lens.strong")}
              </span>
            </>
          ) : mapView === "priority" ? (
            (["High", "Medium", "Low"] as const).map((level) => (
              <span key={level} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_MAP_COLORS[level] }} />
                {t(`risk.levels.${level}`)}
              </span>
            ))
          ) : (
            <span>{t("map.hospitals")}</span>
          )}
        </div>
      </div>
    </>
  );
}
