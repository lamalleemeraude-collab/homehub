"use client";

import {
  currentTidePhase,
  getTideNeedleAngle,
  getTideWaterLevel,
} from "@/lib/tides/saint-lunaire";

type TideClockDialProps = {
  now: Date;
  size?: number;
};

export function TideClockDial({ now, size = 128 }: TideClockDialProps) {
  // Arrondi pour éviter les mismatches d'hydratation (float SSR ≠ client).
  const angle = Math.round(getTideNeedleAngle(now) * 100) / 100;
  const waterLevel = Math.round(getTideWaterLevel(now) * 1000) / 1000;
  const phase = currentTidePhase(now);
  const cx = 60;
  const cy = 60;
  const waterY = Math.round((108 - waterLevel * 72) * 100) / 100;

  return (
    <div
      className="tide-clock-dial relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full drop-shadow-sm"
        role="img"
        aria-label={
          phase === "rising"
            ? "Horloge des marées, marée montante"
            : "Horloge des marées, marée descendante"
        }
      >
        <defs>
          <linearGradient id="tideDialFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="55%" stopColor="#f0fdfa" />
            <stop offset="100%" stopColor="#ccfbf1" />
          </linearGradient>
          <linearGradient id="tideWaterFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="tideNeedleGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <clipPath id="tideDialClip">
            <circle cx={cx} cy={cy} r="52" />
          </clipPath>
        </defs>

        {/* Cadran */}
        <circle
          cx={cx}
          cy={cy}
          r="54"
          fill="url(#tideDialFace)"
          stroke="rgb(255 255 255 / 0.9)"
          strokeWidth="2.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r="52"
          fill="none"
          stroke="rgb(45 212 191 / 0.35)"
          strokeWidth="1"
        />

        {/* Eau animée */}
        <g clipPath="url(#tideDialClip)">
          <rect
            x="0"
            y={waterY}
            width="120"
            height={120 - waterY}
            fill="url(#tideWaterFill)"
            className="tide-water-level"
          />
          <path
            d={`M0 ${waterY} Q30 ${waterY - 4} 60 ${waterY} T120 ${waterY} V120 H0 Z`}
            fill="rgb(255 255 255 / 0.25)"
          />
        </g>

        {/* Repères */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const inner = deg === 0 || deg === 180 ? 44 : 47;
          const outer = 52;
          const x1 = cx + inner * Math.cos(rad);
          const y1 = cy + inner * Math.sin(rad);
          const x2 = cx + outer * Math.cos(rad);
          const y2 = cy + outer * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={deg === 0 || deg === 180 ? "#0f766e" : "#99f6e4"}
              strokeWidth={deg === 0 || deg === 180 ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Labels PM / BM */}
        <text
          x={cx}
          y="17"
          textAnchor="middle"
          className="fill-teal-800 text-[9px] font-black"
          style={{ fontSize: 9 }}
        >
          PM
        </text>
        <text
          x={cx}
          y="112"
          textAnchor="middle"
          className="fill-teal-700/70 text-[9px] font-bold"
          style={{ fontSize: 9 }}
        >
          BM
        </text>

        {/* Aiguille — pointe vers le haut à 0° (= pleine mer) */}
        <g
          className="tide-needle"
          transform={`rotate(${angle} ${cx} ${cy})`}
        >
          <path
            d={`M ${cx} ${cy + 8} L ${cx + 3.5} ${cy} L ${cx} ${cy - 40} L ${cx - 3.5} ${cy} Z`}
            fill="url(#tideNeedleGrad)"
            stroke="#0f766e"
            strokeWidth="0.5"
          />
          <circle cx={cx} cy={cy} r="5.5" fill="#f0fdfa" stroke="#0f766e" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="2" fill="#0f766e" />
        </g>
      </svg>
    </div>
  );
}
