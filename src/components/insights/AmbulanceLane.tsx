"use client";

export function AmbulanceLane() {
  return (
    <div
      className="ambulance-lane relative mt-1 mb-4 rounded-xl border border-border/70 bg-canvas/60 overflow-hidden pointer-events-none select-none"
      aria-hidden
    >
      <svg
        viewBox="0 0 360 64"
        className="w-full h-16 block"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="ambulance-road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EEEBE6" />
            <stop offset="100%" stopColor="#E0DCD4" />
          </linearGradient>
          <linearGradient id="ambulance-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAFAF8" />
            <stop offset="100%" stopColor="#E8E4DC" />
          </linearGradient>
        </defs>

        <rect x="0" y="38" width="360" height="26" fill="url(#ambulance-road)" />
        <line
          x1="0"
          y1="51"
          x2="360"
          y2="51"
          stroke="#C9C4BC"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          className="ambulance-road-dash"
        />

        {/* Faces right — cab leads direction of travel */}
        <g className="ambulance-drive">
          <g transform="translate(68, 0) scale(-1, 1)">
            <ellipse cx="44" cy="58" rx="28" ry="3" fill="#181614" fillOpacity="0.08" />
            <rect x="10" y="30" width="58" height="22" rx="4" fill="url(#ambulance-body)" stroke="#D4CFC6" strokeWidth="1" />
            <rect x="10" y="30" width="22" height="22" rx="4" fill="#FAFAF8" stroke="#D4CFC6" strokeWidth="1" />
            <rect x="14" y="34" width="14" height="10" rx="2" fill="#B8D4E8" fillOpacity="0.7" />
            <rect x="32" y="38" width="34" height="5" rx="1" fill="#B83A32" />
            <rect x="48" y="33" width="4" height="14" rx="0.5" fill="#B83A32" />
            <rect x="43" y="38" width="14" height="4" rx="0.5" fill="#B83A32" />
            <circle cx="22" cy="54" r="5" fill="#3A3835" />
            <circle cx="22" cy="54" r="2" fill="#9C9890" />
            <circle cx="54" cy="54" r="5" fill="#3A3835" />
            <circle cx="54" cy="54" r="2" fill="#9C9890" />
            <rect x="18" y="24" width="10" height="6" rx="2" fill="#3D6B8E" className="ambulance-siren" />
            <rect x="30" y="24" width="10" height="6" rx="2" fill="#E5530E" className="ambulance-siren ambulance-siren--alt" />
          </g>
        </g>
      </svg>
    </div>
  );
}
