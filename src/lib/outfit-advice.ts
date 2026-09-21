import { hasEpsTomorrow } from "@/lib/schedule/timetable-queries";
import type { WeatherData, WeatherIconType } from "@/lib/weather-types";

export type OutfitItem = {
  id: string;
  label: string;
};

const EPS_OUTFIT_ITEMS: OutfitItem[] = [
  { id: "eps-1", label: "T-shirt / débardeur de sport" },
  { id: "eps-2", label: "Short ou jogging" },
  { id: "eps-3", label: "Baskets de sport" },
  { id: "eps-4", label: "Serviette (si douche)" },
];

function weatherOutfitAdvice(weather: WeatherData): {
  advice: string;
  items: OutfitItem[];
} {
  const { icon, temp } = weather;

  if (icon === "cloud-rain") {
    if (temp <= 10) {
      return {
        advice: "Il pleut et il fait froid — équipe-toi bien !",
        items: [
          { id: "rain-1", label: "Manteau imperméable" },
          { id: "rain-2", label: "Bottines ou chaussures étanches" },
          { id: "rain-3", label: "Parapluie dans le sac" },
          { id: "rain-4", label: "Pantalon long" },
        ],
      };
    }
    return {
      advice: "Pluie demain — reste au sec !",
      items: [
        { id: "rain-1", label: "Veste imperméable" },
        { id: "rain-2", label: "Chaussures adaptées à la pluie" },
        { id: "rain-3", label: "Parapluie" },
      ],
    };
  }

  if (icon === "sun" || (icon === "cloud-sun" && temp >= 18)) {
    return {
      advice: "Beau temps — habille-toi léger !",
      items: [
        { id: "sun-1", label: "T-shirt ou chemisier" },
        { id: "sun-2", label: "Pantalon ou jupe légère" },
        { id: "sun-3", label: "Baskets" },
      ],
    };
  }

  if (temp <= 8) {
    return {
      advice: "Froid demain — plusieurs couches !",
      items: [
        { id: "cold-1", label: "Manteau chaud" },
        { id: "cold-2", label: "Pull ou sweat" },
        { id: "cold-3", label: "Pantalon long" },
        { id: "cold-4", label: "Écharpe (optionnel)" },
      ],
    };
  }

  if (temp <= 14) {
    return {
      advice: "Temps frais — une veste suffit.",
      items: [
        { id: "mild-1", label: "Veste ou sweat" },
        { id: "mild-2", label: "Pantalon long" },
        { id: "mild-3", label: "Chaussures fermées" },
      ],
    };
  }

  return {
    advice: "Tenue confortable pour la journée.",
    items: [
      { id: "default-1", label: "Haut adapté à la météo" },
      { id: "default-2", label: "Pantalon confortable" },
      { id: "default-3", label: "Chaussures du quotidien" },
    ],
  };
}

export function outfitAdviceForWeather(
  weather: WeatherData,
  date = new Date()
): {
  advice: string;
  items: OutfitItem[];
  epsTomorrow: boolean;
} {
  const epsTomorrow = hasEpsTomorrow(date);
  const base = weatherOutfitAdvice(weather);

  if (!epsTomorrow) {
    return { ...base, epsTomorrow: false };
  }

  return {
    advice: "EPS demain — prépare ta tenue de sport !",
    items: [...EPS_OUTFIT_ITEMS, ...base.items],
    epsTomorrow: true,
  };
}

export function wmoToWeatherIcon(code: number): WeatherIconType {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "cloud-sun";
  if (code >= 51 && code <= 67) return "cloud-rain";
  if (code >= 80 && code <= 82) return "cloud-rain";
  if (code >= 95) return "cloud-rain";
  if (code >= 3 && code <= 48) return "cloud";
  return "cloud-sun";
}

export function wmoToDescription(code: number): string {
  if (code === 0) return "Ensoleillé";
  if (code === 1) return "Peu nuageux";
  if (code === 2) return "Nuageux";
  if (code === 3) return "Couvert";
  if (code >= 51 && code <= 55) return "Bruine";
  if (code >= 61 && code <= 65) return "Pluie";
  if (code >= 80 && code <= 82) return "Averses";
  if (code >= 95) return "Orage";
  return "Variable";
}
