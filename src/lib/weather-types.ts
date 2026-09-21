export type WeatherIconType = "cloud-sun" | "cloud-rain" | "sun" | "cloud";

export type WeatherData = {
  icon: WeatherIconType;
  temp: number;
  description: string;
};

export const WEATHER_HINTS: Record<WeatherIconType, string> = {
  "cloud-rain": "Parapluie + veste imperméable",
  "cloud-sun": "Couche légère au matin",
  sun: "Crème solaire & chapeau",
  cloud: "Tenue confortable",
};
