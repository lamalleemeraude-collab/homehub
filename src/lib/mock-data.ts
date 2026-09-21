export const mockWeather = {
  today: {
    icon: "cloud-sun" as const,
    temp: 18,
    description: "Nuageux",
  },
  tomorrow: {
    icon: "cloud-rain" as const,
    temp: 12,
    description: "Pluie",
  },
};

export const mockDinner = {
  name: "Lasagnes",
  emoji: "🍝",
  subtitle: "Maison, avec salade verte",
};

export const mockDad = {
  status: "Au Travail 1",
  returnTime: "19h00",
};

export const mockDadMessage = {
  text: "Bonne journée ma puce ! N'oublie pas ta flûte demain 🎵",
  time: "07:32",
};

export const mockDomoticScenes = [
  {
    id: "homework",
    label: "Mode Devoirs",
    gradient: "from-sky-400 to-blue-500",
    icon: "book" as const,
  },
  {
    id: "dinner",
    label: "Dîner",
    gradient: "from-orange-400 to-amber-500",
    icon: "utensils" as const,
  },
  {
    id: "sleep",
    label: "Dodo",
    gradient: "from-indigo-400 to-violet-500",
    icon: "moon" as const,
  },
];

export const mockOutfit = {
  advice: "Prends un manteau et tes bottines",
  items: [
    { id: "1", label: "Manteau imperméable" },
    { id: "2", label: "Bottines" },
    { id: "3", label: "Pantalon long" },
  ],
};

export const mockMaelleScheduleDays = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
];

export const mockMaelleScheduleSlots = [
  { time: "8h–9h", subject: "Français", room: "Salle 204" },
  { time: "9h–10h", subject: "Maths", room: "Salle 112" },
  { time: "10h–11h", subject: "Anglais", room: "Salle 305" },
  { time: "11h–12h", subject: "Sport", room: "Gymnase" },
  { time: "14h–15h", subject: "SVT", room: "Labo B" },
  { time: "15h–16h", subject: "Histoire", room: "Salle 204" },
];

export const mockDadAgenda = [
  {
    id: "1",
    title: "Travail 1 — Matin",
    time: "7h00 – 13h00",
    availability: "occupé" as const,
  },
  {
    id: "2",
    title: "Pause déjeuner",
    time: "13h00 – 14h00",
    availability: "libre" as const,
  },
  {
    id: "3",
    title: "Travail 2 — Après-midi",
    time: "14h00 – 19h00",
    availability: "occupé" as const,
  },
  {
    id: "4",
    title: "Retour à la maison",
    time: "19h00",
    availability: "libre" as const,
  },
];
