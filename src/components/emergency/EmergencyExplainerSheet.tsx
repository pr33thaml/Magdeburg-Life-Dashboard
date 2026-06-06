"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { EmergencyPoint } from "@/lib/types";
import { VEHICLE_COLORS } from "@/lib/chart-theme";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { useFormatNumber } from "@/lib/i18n/useFormatNumber";
import { AmbulanceIcon } from "./AmbulanceIcon";
import { MedicalIcon } from "./MedicalIcon";
import { PlaneIcon } from "./PlaneIcon";
import { RescueIcon } from "./RescueIcon";

export type EmergencyCategoryId = "medical" | "transport" | "rescue" | "air";

const CATEGORY_KEYS: Record<EmergencyCategoryId, keyof EmergencyPoint> = {
  medical: "medicalVehicles",
  transport: "rescueTransport",
  rescue: "ambulances",
  air: "helicopter",
};

const CATEGORY_COLORS: Record<EmergencyCategoryId, string> = {
  medical: VEHICLE_COLORS.medical,
  transport: VEHICLE_COLORS.transport,
  rescue: VEHICLE_COLORS.rescue,
  air: VEHICLE_COLORS.air,
};

const CATEGORY_ORDER: EmergencyCategoryId[] = ["medical", "transport", "rescue", "air"];

function formatSharePct(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "0%";
  const pct = (value / max) * 100;
  if (pct < 0.05) return "<0.1%";
  if (pct < 1) return `${pct.toFixed(1)}%`;
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

function CategoryIcon({ id, size = 20 }: { id: EmergencyCategoryId; size?: number }) {
  const color = CATEGORY_COLORS[id];
  const wrap = (node: ReactNode) => (
    <span className="inline-flex" style={{ color }}>
      {node}
    </span>
  );
  switch (id) {
    case "medical":
      return wrap(<MedicalIcon size={size} className="pictogram-icon-medical" />);
    case "transport":
      return wrap(<AmbulanceIcon size={size} className="pictogram-icon-ambulance" />);
    case "rescue":
      return wrap(<RescueIcon size={size} className="pictogram-icon-rescue" />);
    case "air":
      return wrap(<PlaneIcon size={size} className="pictogram-icon-plane" />);
  }
}

interface EmergencyExplainerSheetProps {
  open: boolean;
  onClose: () => void;
  row: EmergencyPoint;
  year: number;
  initialCategory?: EmergencyCategoryId;
}

export function EmergencyExplainerSheet({
  open,
  onClose,
  row,
  year,
  initialCategory = "transport",
}: EmergencyExplainerSheetProps) {
  const t = useTranslations();
  const { formatNumber } = useFormatNumber();
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<EmergencyCategoryId>(initialCategory);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setFlipped(false);
      return;
    }
    setSelected(initialCategory);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, initialCategory]);

  const total = row.total > 0 ? row.total : 1;

  const noteBody = useMemo(() => {
    const count = row[CATEGORY_KEYS[selected]] as number;
    const pct = formatSharePct(count, total);
    return t(`charts.emergency.explainer.category.${selected}`)
      .replace("{count}", formatNumber(count))
      .replace("{pct}", pct)
      .replace("{year}", String(year))
      .replace("{total}", formatNumber(row.total));
  }, [selected, row, total, year, t, formatNumber]);

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      className="gap-explainer-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-explainer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        aria-label={t("charts.emergency.explainer.close")}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md mx-auto max-h-[min(92vh,720px)]">
        <div
          className={`gap-explainer-flip relative w-full transition-transform duration-700 ease-out ${
            flipped ? "gap-explainer-flip--back" : ""
          }`}
        >
          <div className="gap-explainer-face gap-explainer-face--front bg-surface border border-border shadow-elevated rounded-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
            <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-border/80 bg-canvas/50 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-1">
                    {t("charts.emergency.explainer.eyebrow")}
                  </p>
                  <h2 id="emergency-explainer-title" className="font-serif text-2xl text-ink">
                    {t("charts.emergency.explainer.title")}
                  </h2>
                  <p className="text-sm text-ink-muted mt-1">
                    {t("charts.emergency.explainer.yearContext")
                      .replace("{total}", formatNumber(row.total))
                      .replace("{year}", String(year))}
                  </p>
                </div>
                <button
                  type="button"
                  data-cursor-interactive
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 rounded-full border border-border text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
                  aria-label={t("charts.emergency.explainer.close")}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 pb-8">
              <p className="text-center text-xs text-ink-faint mb-4">
                {t("charts.emergency.explainer.tapCategory")}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {CATEGORY_ORDER.map((id) => {
                  const active = selected === id;
                  const count = row[CATEGORY_KEYS[id]] as number;
                  const pct = formatSharePct(count, total);
                  return (
                    <button
                      key={id}
                      type="button"
                      data-cursor-interactive
                      onClick={() => setSelected(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "border-ink bg-ink text-surface"
                          : "border-border text-ink-muted hover:border-border-strong hover:text-ink bg-surface"
                      }`}
                    >
                      <CategoryIcon id={id} size={16} />
                      <span>{t(`charts.emergency.categories.${id}`)}</span>
                      <span className={`tabular-nums ${active ? "text-surface/80" : "text-ink-faint"}`}>
                        {pct}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center mb-3">
                <div
                  className="w-14 h-14 rounded-2xl border border-border/80 flex items-center justify-center bg-canvas/60"
                  style={{ color: CATEGORY_COLORS[selected] }}
                >
                  <CategoryIcon id={selected} size={28} />
                </div>
              </div>

              <svg
                width="48"
                height="28"
                viewBox="0 0 48 28"
                className="mx-auto my-1 shrink-0 pointer-events-none block"
                aria-hidden
              >
                <line x1="24" y1="2" x2="24" y2="18" className="gap-callout-line" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="18" x2="36" y2="26" className="gap-callout-line" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: "0.12s" }} />
              </svg>

              <div
                key={selected}
                className="w-full gap-callout-card gap-callout-card--in rounded-xl border border-border/80 bg-[#FFFDF8] px-4 py-4 shadow-card"
              >
                <div className="flex justify-center">
                  <span className="gap-callout-pill gap-callout-pill--in">
                    {t(`charts.emergency.categories.${selected}`)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink font-sans text-center">
                  {noteBody}
                </p>
                <p className="mt-2 text-xs text-ink-muted tabular-nums font-sans text-center">
                  {formatNumber(row[CATEGORY_KEYS[selected]] as number)} · {formatSharePct(row[CATEGORY_KEYS[selected]] as number, total)}
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(true)}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium border border-accent/35 text-accent bg-accent-muted hover:bg-accent/10 transition-colors"
              >
                {t("charts.emergency.explainer.flipToMethod")}
              </button>
              <button
                type="button"
                data-cursor-interactive
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink-muted hover:text-ink transition-colors"
              >
                {t("charts.emergency.explainer.close")}
              </button>
            </div>
          </div>

          <div className="gap-explainer-face gap-explainer-face--back absolute inset-0 bg-surface border border-border shadow-elevated rounded-2xl overflow-hidden flex flex-col max-h-[min(92vh,720px)]">
            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-border/80 shrink-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-1">
                {t("charts.emergency.explainer.methodEyebrow")}
              </p>
              <h2 className="font-serif text-xl text-ink">{t("charts.emergency.explainer.methodTitle")}</h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-sm text-ink-muted leading-relaxed">
              <p className="text-ink text-[15px] leading-relaxed">
                {t("charts.emergency.explainer.methodIntro")}
              </p>
              <p>{t("charts.emergency.explainer.methodSource")}</p>
              <ul className="list-disc pl-5 space-y-2">
                {CATEGORY_ORDER.map((id) => (
                  <li key={id}>{t(`charts.emergency.explainer.method.${id}`)}</li>
                ))}
              </ul>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-border/80 bg-canvas/30 shrink-0">
              <button
                type="button"
                data-cursor-interactive
                onClick={() => setFlipped(false)}
                className="w-full px-4 py-2.5 rounded-full text-sm font-medium border border-border text-ink hover:bg-canvas transition-colors"
              >
                {t("charts.emergency.explainer.flipBack")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
