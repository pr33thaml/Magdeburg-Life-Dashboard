"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const CITIZEN_STYLES = [
  { emoji: "🧑", bg: "#E8EFEB", ring: "#2D4A3E" },
  { emoji: "👩", bg: "#FDEBE3", ring: "#E5530E" },
  { emoji: "👨", bg: "#E3EEF5", ring: "#3D6B8E" },
  { emoji: "🧒", bg: "#EDF0E8", ring: "#5C6B4A" },
  { emoji: "👴", bg: "#F5EDE8", ring: "#A65D2E" },
  { emoji: "👵", bg: "#F0E8F2", ring: "#6B5B7A" },
] as const;

const MAX_VISIBLE = 9;
const TICK_MS = 1050;

interface Citizen {
  id: number;
  styleIndex: number;
}

export function CitizenArrivalCanvas() {
  const t = useTranslations();
  const [citizens, setCitizens] = useState<Citizen[]>([{ id: 0, styleIndex: 0 }]);
  const [count, setCount] = useState(1);
  const [ping, setPing] = useState(false);
  const nextId = useRef(1);
  const nextStyle = useRef(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const id = nextId.current++;
      const styleIndex = nextStyle.current++ % CITIZEN_STYLES.length;

      setCitizens((prev) => {
        const next = [...prev, { id, styleIndex }];
        return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
      });
      setCount((c) => c + 1);
      setPing(true);
      window.setTimeout(() => setPing(false), 320);
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="citizen-arrival relative mt-1 mb-4 rounded-xl border border-border/70 bg-canvas/60 px-3 py-3 overflow-hidden pointer-events-none select-none"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="text-[10px] uppercase tracking-wider text-ink-faint font-medium">
          {t("charts.insights.citizenLive")}
        </p>
        <div
          className={`citizen-counter flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-xs font-semibold tabular-nums text-accent ${
            ping ? "citizen-counter--ping" : ""
          }`}
        >
          <span className="text-signal-migration">+</span>
          <span key={count} className="citizen-counter-num">
            {count}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-1.5 min-h-[2.75rem]">
        {citizens.map((citizen, i) => {
          const style = CITIZEN_STYLES[citizen.styleIndex];
          const isNew = i === citizens.length - 1;
          return (
            <div
              key={citizen.id}
              className={`citizen-chip ${isNew ? "citizen-chip--new" : ""}`}
              style={
                {
                  "--chip-bg": style.bg,
                  "--chip-ring": style.ring,
                  animationDelay: isNew ? "0ms" : undefined,
                } as React.CSSProperties
              }
            >
              <span className="citizen-chip-emoji" role="img" aria-hidden>
                {style.emoji}
              </span>
              {isNew && <span className="citizen-chip-ting" aria-hidden />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
