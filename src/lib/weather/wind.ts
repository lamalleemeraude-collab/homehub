/** Conversion m/s → km/h (Open-Meteo). */
export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

const DIRECTIONS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSO",
  "SO",
  "OSO",
  "O",
  "ONO",
  "NO",
  "NNO",
] as const;

export function windDirectionLabel(degrees: number | null | undefined): string {
  if (degrees == null || Number.isNaN(degrees)) return "—";
  const idx = Math.round(degrees / 22.5) % 16;
  return DIRECTIONS[idx];
}

export function windSpeedLabel(kmh: number): string {
  if (kmh < 6) return "Calme";
  if (kmh < 20) return "Brise légère";
  if (kmh < 35) return "Brise modérée";
  if (kmh < 50) return "Vent fort";
  if (kmh < 70) return "Vent très fort";
  return "Tempête";
}

export function formatWind(kmh: number, directionDeg?: number | null): string {
  const dir = windDirectionLabel(directionDeg);
  return `${windSpeedLabel(kmh)} · ${kmh} km/h ${dir}`;
}
