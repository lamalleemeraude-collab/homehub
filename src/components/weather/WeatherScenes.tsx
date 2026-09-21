import type { WeatherIconType } from "@/lib/weather-types";

type SceneProps = {
  className?: string;
};

export function RainScene({ className = "h-24 w-24" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      role="img"
    >
      <defs>
        <linearGradient id="rain-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="rain-drop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="rain-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="60" cy="95" rx="38" ry="8" fill="white" opacity="0.15" />

      <g className="weather-cloud-drift weather-cloud-drift-back">
        <ellipse cx="45" cy="48" rx="28" ry="20" fill="url(#rain-cloud)" />
        <ellipse cx="68" cy="42" rx="32" ry="24" fill="url(#rain-cloud)" />
      </g>
      <g className="weather-cloud-drift weather-cloud-drift-front">
        <ellipse cx="82" cy="52" rx="22" ry="16" fill="#94a3b8" />
      </g>

      {[32, 48, 64, 80].map((x, i) => (
        <line
          key={x}
          x1={x}
          y1={68}
          x2={x - 4}
          y2={88}
          stroke="url(#rain-drop)"
          strokeWidth="3"
          strokeLinecap="round"
          className="weather-rain-drop"
          style={{ animationDelay: `${i * 0.15}s` }}
          filter="url(#rain-glow)"
        />
      ))}
    </svg>
  );
}

export function CloudSunScene({ className = "h-24 w-24" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      role="img"
    >
      <defs>
        <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <linearGradient id="part-cloud" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      <g className="weather-sun-rays weather-sun-rays-breathe">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="38"
            y1="38"
            x2="38"
            y2="22"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
            transform={`rotate(${deg} 38 38)`}
          />
        ))}
      </g>

      <circle cx="38" cy="38" r="18" fill="url(#sun-core)" className="weather-sun-pulse" />

      <g className="weather-cloud-drift weather-cloud-drift-front">
        <ellipse cx="72" cy="62" rx="30" ry="22" fill="url(#part-cloud)" />
        <ellipse cx="52" cy="68" rx="24" ry="18" fill="#cbd5e1" />
        <ellipse cx="88" cy="66" rx="20" ry="15" fill="#94a3b8" />
      </g>
    </svg>
  );
}

export function SunScene({ className = "h-24 w-24" }: SceneProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <radialGradient id="sun-bright" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      <g className="weather-sun-rays weather-sun-rays-spin weather-sun-rays-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="60"
            y1="60"
            x2="60"
            y2="18"
            stroke="#fbbf24"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 60 60)`}
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="26" fill="url(#sun-bright)" className="weather-sun-pulse" />
    </svg>
  );
}

export function CloudScene({ className = "h-24 w-24" }: SceneProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="cloud-soft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <g className="weather-cloud-drift weather-cloud-drift-back">
        <ellipse cx="60" cy="55" rx="40" ry="28" fill="url(#cloud-soft)" />
      </g>
      <g className="weather-cloud-drift weather-cloud-drift-front">
        <ellipse cx="38" cy="62" rx="26" ry="20" fill="#cbd5e1" />
        <ellipse cx="82" cy="60" rx="28" ry="22" fill="#94a3b8" />
      </g>
    </svg>
  );
}

export function WeatherScene({
  icon,
  className,
}: {
  icon: WeatherIconType;
  className?: string;
}) {
  switch (icon) {
    case "cloud-rain":
      return <RainScene className={className} />;
    case "cloud-sun":
      return <CloudSunScene className={className} />;
    case "sun":
      return <SunScene className={className} />;
    default:
      return <CloudScene className={className} />;
  }
}
