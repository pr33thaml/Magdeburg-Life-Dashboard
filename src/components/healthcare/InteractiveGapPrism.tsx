"use client";

import { useMemo } from "react";
import type { AccessLensDistrict, LensId, LensLevel } from "@/lib/types";
import type { LensNote } from "@/lib/gap-explainer-notes";
import { LENS_COLORS, LENS_IDS, lensLevelFor, isCompoundGap } from "@/lib/access-lens";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const GRADIENT: Record<LensLevel, [string, string]> = {
  weak: ["#C44E45", "#8E2E28"],
  medium: ["#D4B84A", "#9A7A18"],
  strong: ["#3D6B58", "#1E3D32"],
};

const WEDGE_START: Record<LensId, number> = {
  physicians: 330,
  transport: 90,
  transit: 210,
};

const PRISM_SIZE = 200;

function svgNum(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function wedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = svgNum(cx + r * Math.cos(toRad(startDeg - 90)));
  const y1 = svgNum(cy + r * Math.sin(toRad(startDeg - 90)));
  const x2 = svgNum(cx + r * Math.cos(toRad(endDeg - 90)));
  const y2 = svgNum(cy + r * Math.sin(toRad(endDeg - 90)));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${svgNum(cx)} ${svgNum(cy)} L ${x1} ${y1} A ${svgNum(r)} ${svgNum(r)} 0 ${large} 1 ${x2} ${y2} Z`;
}

interface InteractiveGapPrismProps {
  district: AccessLensDistrict;
  activeLenses: Set<LensId>;
  notes: LensNote[];
  selectedId: LensId | null;
  onSelect: (id: LensId) => void;
}

export function InteractiveGapPrism({
  district,
  activeLenses,
  notes,
  selectedId,
  onSelect,
}: InteractiveGapPrismProps) {
  const t = useTranslations();
  const compound = isCompoundGap(district, activeLenses);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  const cx = PRISM_SIZE / 2;
  const cy = PRISM_SIZE / 2;
  const r = PRISM_SIZE * 0.42;

  return (
    <div className="flex flex-col items-center w-full pb-2">
      <p className="text-center text-xs text-ink-faint mb-3">{t("map.gapExplainer.tapWedge")}</p>

      {/* Lens chips — top of panel so footer never clips them */}
      <div className="flex flex-wrap justify-center gap-2 mb-5 w-full">
        {notes.map((note) => {
          const active = selectedId === note.id;
          return (
            <button
              key={note.id}
              type="button"
              data-cursor-interactive
              onClick={() => onSelect(note.id)}
              className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "border-ink bg-ink text-surface"
                  : "border-border text-ink-muted hover:border-border-strong hover:text-ink"
              }`}
            >
              {t(`map.lens.toggles.${note.id}`)}
            </button>
          );
        })}
      </div>

      {/* Prism — nothing overlaps this layer */}
      <div className="relative z-10 flex justify-center items-center shrink-0">
        <svg
          width={PRISM_SIZE}
          height={PRISM_SIZE}
          viewBox={`0 0 ${PRISM_SIZE} ${PRISM_SIZE}`}
          className={`lens-prism block ${compound ? "lens-prism--compound" : ""}`}
          role="img"
          aria-label={t("map.gapExplainer.prismAria")}
        >
          <defs>
            {LENS_IDS.map((id) => {
              const level = lensLevelFor(district, id);
              const [a, b] = GRADIENT[level];
              return (
                <linearGradient
                  key={id}
                  id={`igap-${district.districtCode}-${id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={a} />
                  <stop offset="100%" stopColor={b} />
                </linearGradient>
              );
            })}
            <filter id="igap-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {compound && (
            <circle
              cx={cx}
              cy={cy}
              r={r + 6}
              fill="none"
              stroke="#6B2D5C"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              className="lens-prism-ring"
            />
          )}

          <circle cx={cx} cy={cy} r={r + 2} fill="#F7F5F2" stroke="#E5E1DB" strokeWidth="0.6" />

          {LENS_IDS.map((id) => {
            const start = WEDGE_START[id];
            const active = activeLenses.has(id);
            const level = lensLevelFor(district, id);
            const selected = selectedId === id;
            return (
              <path
                key={id}
                d={wedgePath(cx, cy, r, start, start + 120)}
                fill={active ? `url(#igap-${district.districtCode}-${id})` : "#E5E1DB"}
                fillOpacity={active ? (selected ? 1 : 0.92) : 0.35}
                stroke={selected ? "#181614" : "#FAF9F7"}
                strokeWidth={selected ? 2.5 : 1.4}
                filter={active && level === "weak" ? "url(#igap-glow)" : undefined}
                className={`gap-prism-wedge ${active ? "cursor-pointer" : ""}`}
                style={{ pointerEvents: active ? "auto" : "none" }}
                onClick={() => active && onSelect(id)}
                onKeyDown={(e) => {
                  if (active && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelect(id);
                  }
                }}
                tabIndex={active ? 0 : -1}
                role="button"
                aria-pressed={selected}
                aria-label={`${t(`map.lens.toggles.${id}`)} — ${t(`map.lens.levels.${level}`)}`}
              />
            );
          })}

          <circle cx={cx} cy={cy} r={r * 0.2} fill="#FAF9F7" stroke="#E5E1DB" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Sketch connector — decorative only, sits between prism and card */}
      {selectedNote && (
        <svg
          width="48"
          height="28"
          viewBox="0 0 48 28"
          className="my-1 shrink-0 pointer-events-none"
          aria-hidden
        >
          <line
            x1="24"
            y1="2"
            x2="24"
            y2="18"
            className="gap-callout-line"
            stroke="#2D4A3E"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="24"
            y1="18"
            x2="36"
            y2="26"
            className="gap-callout-line"
            stroke="#2D4A3E"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ animationDelay: "0.12s" }}
          />
        </svg>
      )}

      {/* Note card — full width below prism, never blocks wedges */}
      {selectedNote && (
        <div
          key={selectedNote.id}
          className="w-full gap-callout-card gap-callout-card--in rounded-xl border border-border/80 bg-[#FFFDF8] px-4 py-4 shadow-card"
        >
          <div className="flex justify-center">
            <span className="gap-callout-pill gap-callout-pill--in">
              {t(`map.lens.toggles.${selectedNote.id}`)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink font-sans text-center">
            {selectedNote.body}
          </p>
          <p className="mt-2 text-xs text-ink-muted tabular-nums font-sans text-center">
            {selectedNote.value} ·{" "}
            <span style={{ color: LENS_COLORS[selectedNote.level as LensLevel] }}>
              {t(`map.lens.levels.${selectedNote.level}`)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
