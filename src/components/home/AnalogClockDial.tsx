"use client";

type AnalogClockDialProps = {
  now: Date;
  size?: number;
};

export function AnalogClockDial({ now, size = 88 }: AnalogClockDialProps) {
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  const cx = 50;
  const cy = 50;

  return (
    <div
      className="analog-clock-dial shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="clockFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r="46"
          fill="url(#clockFace)"
          stroke="rgb(148 163 184 / 0.45)"
          strokeWidth="2"
        />
        <circle
          cx={cx}
          cy={cy}
          r="43"
          fill="none"
          stroke="rgb(226 232 240 / 0.9)"
          strokeWidth="1"
        />

        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const isMajor = i % 3 === 0;
          const inner = isMajor ? 38 : 40;
          const outer = 44;
          return (
            <line
              key={i}
              x1={cx + inner * Math.cos(angle)}
              y1={cy + inner * Math.sin(angle)}
              x2={cx + outer * Math.cos(angle)}
              y2={cy + outer * Math.sin(angle)}
              stroke={isMajor ? "#334155" : "#94a3b8"}
              strokeWidth={isMajor ? 2.2 : 1.2}
              strokeLinecap="round"
            />
          );
        })}

        <g transform={`rotate(${hourAngle} ${cx} ${cy})`}>
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - 22}
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        <g transform={`rotate(${minuteAngle} ${cx} ${cy})`}>
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - 30}
            stroke="#475569"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        <g className="analog-second-hand" transform={`rotate(${secondAngle} ${cx} ${cy})`}>
          <line
            x1={cx}
            y1={cy + 8}
            x2={cx}
            y2={cy - 34}
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        <circle cx={cx} cy={cy} r="3.5" fill="#1e293b" />
        <circle cx={cx} cy={cy} r="1.5" fill="#8b5cf6" />
      </svg>
    </div>
  );
}
