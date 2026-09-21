export type BusTrip = {
  id: string;
  line: string;
  direction: "aller" | "retour" | "retour-midi";
  departTime: string;
  departStop: string;
  arriveTime: string;
  arriveStop: string;
  days: number[];
};

/** Ligne DI10 — Maelle, demi-pensionnaire, Collège Sainte Marie (2026/2027). */
export const BUS_TRIPS: BusTrip[] = [
  {
    id: "matin",
    line: "DI10",
    direction: "aller",
    departTime: "07:58",
    departStop: "Saint-Lunaire — Grands Prés",
    arriveTime: "08:20",
    arriveStop: "La Richardais — Collège Ste Marie",
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "retour-midi",
    line: "DI10",
    direction: "retour-midi",
    departTime: "12:30",
    departStop: "La Richardais — Collège Ste Marie",
    arriveTime: "12:52",
    arriveStop: "Saint-Lunaire — Grands Prés",
    days: [3],
  },
  {
    id: "retour-soir",
    line: "DI10",
    direction: "retour",
    departTime: "17:05",
    departStop: "La Richardais — Collège Ste Marie",
    arriveTime: "17:27",
    arriveStop: "Saint-Lunaire — Grands Prés",
    days: [1, 2, 4, 5],
  },
];

export const BUS_PDF_PATH = "/docs/horaires-bus-maelle.pdf";
export const BREIZHGO_URL = "https://www.breizhgo.bzh";

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

const DIRECTION_LABELS: Record<BusTrip["direction"], string> = {
  aller: "Aller (matin)",
  "retour-midi": "Retour (midi)",
  retour: "Retour (soir)",
};

export function directionLabel(direction: BusTrip["direction"]): string {
  return DIRECTION_LABELS[direction];
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function tripsForDay(dayIndex: number): BusTrip[] {
  return BUS_TRIPS.filter((trip) => trip.days.includes(dayIndex));
}

export function tripsForDate(date = new Date()): BusTrip[] {
  return tripsForDay(date.getDay());
}

export function formatDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] ?? "";
}

export const WEEKDAY_INDICES = [1, 2, 3, 4, 5] as const;

export const WEEKDAY_SHORT = [
  "",
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
] as const;

export type BusScheduleRow = {
  id: string;
  label: string;
  trip: BusTrip;
};

export function busScheduleRows(): BusScheduleRow[] {
  return BUS_TRIPS.map((trip) => ({
    id: trip.id,
    label: directionLabel(trip.direction),
    trip,
  }));
}

export function departTimeOnDay(
  trip: BusTrip,
  dayIndex: number
): string | null {
  return trip.days.includes(dayIndex) ? trip.departTime : null;
}

export function nextBusTrip(date = new Date()): BusTrip | null {
  const dayIndex = date.getDay();
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const todayTrips = tripsForDay(dayIndex);

  for (const trip of todayTrips) {
    if (parseTime(trip.departTime) > nowMinutes) return trip;
  }

  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (dayIndex + offset) % 7;
    const trips = tripsForDay(nextDay);
    if (trips.length > 0) return trips[0];
  }

  return null;
}

export function nextBusSummary(date = new Date()): string | null {
  const trip = nextBusTrip(date);
  if (!trip) return null;

  const dayIndex = date.getDay();
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const isToday = trip.days.includes(dayIndex) && parseTime(trip.departTime) > nowMinutes;
  const dayLabel = isToday ? "Aujourd'hui" : formatDayName(trip.days[0]);

  return `${dayLabel} · ${trip.departTime} → ${trip.arriveTime}`;
}
