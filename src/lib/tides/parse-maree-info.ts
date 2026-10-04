import type { TideScheduleRaw } from "./types";

const MONTHS: Record<string, number> = {
  janvier: 1,
  fevrier: 2,
  février: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  aout: 8,
  août: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  decembre: 12,
  décembre: 12,
};

function decode(html: string): string {
  return html
    .replace(/&eacute;/gi, "é")
    .replace(/&egrave;/gi, "è")
    .replace(/&agrave;/gi, "à")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseHeaderDate(html: string): { year: number; month: number; day: number } | null {
  const text = decode(html);
  const m = text.match(
    /(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})/i
  );
  if (!m) return null;
  const monthKey = m[2]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const month = MONTHS[monthKey] ?? MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return { day: Number(m[1]), month, year: Number(m[3]) };
}

function parisOffset(y: number, m: number, d: number): string {
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    timeZoneName: "longOffset",
  }).formatToParts(probe);
  const raw =
    parts.find((p) => p.type === "timeZoneName")?.value?.replace("GMT", "") ||
    "+02:00";
  if (/^[+-]\d{2}:\d{2}$/.test(raw)) return raw;
  if (/^[+-]\d{2}$/.test(raw)) return `${raw}:00`;
  return "+02:00";
}

function toIsoLocal(
  y: number,
  m: number,
  d: number,
  hh: number,
  mm: number
): string {
  const offset = parisOffset(y, m, d);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00${offset}`;
}

/**
 * Parse le tableau multi-jours de maree.info (port Saint-Malo = /52).
 */
export function parseMareeInfoHtml(html: string): TideScheduleRaw[] {
  const header = parseHeaderDate(html);
  if (!header) throw new Error("Date d’en-tête marée introuvable");

  const events: TideScheduleRaw[] = [];
  const rowRe = /<tr class="MJ[^"]*"[\s\S]*?<\/tr>/gi;
  const rows = html.match(rowRe) ?? [];

  let cursor = new Date(header.year, header.month - 1, header.day);

  for (const row of rows) {
    const dayMatch = row.match(/<b>(\d{2})<\/b>/);
    if (!dayMatch) continue;
    const dayNum = Number(dayMatch[1]);

    // Avancer le curseur jusqu’au bon jour (changement de mois inclus)
    let guard = 0;
    while (cursor.getDate() !== dayNum && guard < 40) {
      cursor.setDate(cursor.getDate() + 1);
      guard++;
    }
    if (cursor.getDate() !== dayNum) continue;

    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const d = cursor.getDate();

    const timeCell = row.match(/<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>/i);
    if (!timeCell) continue;

    const times = [...timeCell[1].matchAll(/(\d{2})h(\d{2})/g)].map((x) => ({
      h: Number(x[1]),
      min: Number(x[2]),
      bold: false,
    }));
    // bold markers interleaved in same cell
    const boldTimes = new Set(
      [...timeCell[1].matchAll(/<b>(\d{2})h(\d{2})<\/b>/g)].map(
        (x) => `${x[1]}h${x[2]}`
      )
    );
    for (const t of times) {
      if (boldTimes.has(`${String(t.h).padStart(2, "0")}h${String(t.min).padStart(2, "0")}`)) {
        t.bold = true;
      }
    }

    const heights = [...timeCell[2].matchAll(/(\d+),(\d{2})m/g)].map(
      (x) => Number(`${x[1]}.${x[2]}`)
    );
    const coefs = [...timeCell[3].matchAll(/<b>(\d{2,3})<\/b>/g)].map((x) =>
      Number(x[1])
    );

    if (times.length === 0 || times.length !== heights.length) continue;

    const mean =
      heights.reduce((a, b) => a + b, 0) / Math.max(heights.length, 1);
    let coefIdx = 0;

    for (let i = 0; i < times.length; i++) {
      const isHigh = times[i].bold || heights[i] >= mean;
      const coefficient =
        isHigh && coefIdx < coefs.length ? coefs[coefIdx++] : undefined;
      events.push({
        iso: toIsoLocal(y, m, d, times[i].h, times[i].min),
        type: isHigh ? "high" : "low",
        heightM: heights[i],
        coefficient,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // Déduplique / trie
  const seen = new Set<string>();
  return events
    .filter((e) => {
      if (seen.has(e.iso)) return false;
      seen.add(e.iso);
      return true;
    })
    .sort((a, b) => a.iso.localeCompare(b.iso));
}
