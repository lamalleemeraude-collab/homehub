import type { HubEventType } from "@/lib/hub-events";
import type { CalendarProvider } from "./types";

export type CalendarSourceId = "maelle" | "papa" | "roulle";

export type CalendarAccount = "iCloud" | "Exchange" | "Autres";

export type CalendarSourceDefinition = {
  id: CalendarSourceId;
  hubType: HubEventType;
  label: string;
  /** Nom affiché dans l'app Calendrier iPhone */
  iphoneName: string;
  account: CalendarAccount;
  envUrlKey: string;
  defaultUrl?: string;
  providerEnvKey?: string;
};

const MAELLE_ICAL_URL =
  "webcal://p403-caldav.icloud.com/published/2/MTczMzY4NjE0NjAxNzMzNuMr1E-KtS6HUEo7RDHbLVtIVmkGgs8_mi8EDfTIMS80y74rx40bbK31vA9XoFEjIY9fpIcY43Tp4PE6WtWzgQw";

const PAPA_ICAL_URL =
  "webcal://p403-caldav.icloud.com/published/2/MTczMzY4NjE0NjAxNzMzNuMr1E-KtS6HUEo7RDHbLVt8c7q-lXGMUmQDphqnBvbfn-atGnMmrcQe5RKPUJpdUE7TxkURo-jysi0RCNfme4E";

const ROULLE_ICAL_URL =
  "https://outlook.office365.com/owa/calendar/2639f9baca6143a8aedbc019aafd7501@saint-lunaire.fr/119e503c3c604ab9abe0cf53d9fea32d1308276581879382723/calendar.ics";

/**
 * 3 agendas — correspondance iPhone :
 * - iCloud : Collège Maelle 6e + Papa (déjà liés)
 * - Exchange : Philippe ROULLÉ (lien iCal dans .env.local)
 */
export const CALENDAR_SOURCES: CalendarSourceDefinition[] = [
  {
    id: "maelle",
    hubType: "maelle",
    label: "MAELLE",
    iphoneName: "Collège Maelle 6e — calendrier",
    account: "iCloud",
    envUrlKey: "MAELLE_CALENDAR_URL",
    defaultUrl: MAELLE_ICAL_URL,
    providerEnvKey: "MAELLE_CALENDAR_PROVIDER",
  },
  {
    id: "papa",
    hubType: "papa",
    label: "FRANÇOIS",
    iphoneName: "Papa",
    account: "iCloud",
    envUrlKey: "PAPA_CALENDAR_URL",
    defaultUrl: PAPA_ICAL_URL,
    providerEnvKey: "PAPA_CALENDAR_PROVIDER",
  },
  {
    id: "roulle",
    hubType: "roulle",
    label: "PHILIPPE ROULLÉ",
    iphoneName: "Philippe ROULLÉ",
    account: "Exchange",
    envUrlKey: "ROULLE_CALENDAR_URL",
    defaultUrl: ROULLE_ICAL_URL,
  },
];

export function getCalendarSource(id: CalendarSourceId): CalendarSourceDefinition {
  const source = CALENDAR_SOURCES.find((s) => s.id === id);
  if (!source) throw new Error(`Calendrier inconnu: ${id}`);
  return source;
}

export function resolveSourceUrl(source: CalendarSourceDefinition): string | null {
  const fromEnv = process.env[source.envUrlKey]?.trim();
  if (fromEnv) return fromEnv;

  if (source.id === "maelle") {
    return process.env.ICLOUD_CALENDAR_URL?.trim() ?? source.defaultUrl ?? null;
  }
  if (source.id === "papa") {
    return (
      process.env.SECOND_CALENDAR_URL?.trim() ?? source.defaultUrl ?? null
    );
  }
  if (source.id === "roulle") {
    return process.env.ROULLE_CALENDAR_URL?.trim() ?? source.defaultUrl ?? null;
  }

  return source.defaultUrl ?? null;
}

export function resolveSourceProvider(
  source: CalendarSourceDefinition
): CalendarProvider {
  const key = source.providerEnvKey;
  if (key) {
    const value = process.env[key] as CalendarProvider | undefined;
    if (value === "ical" || value === "google") return value;
  }
  return "ical";
}

export const CONFIGURED_CALENDAR_SOURCES = CALENDAR_SOURCES.filter((source) =>
  Boolean(resolveSourceUrl(source))
);
