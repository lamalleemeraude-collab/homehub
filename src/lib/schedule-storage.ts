export type StoredSchedule = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
};

const STORAGE_KEY = "homehub-emploi-du-temps";

export function loadSchedule(): StoredSchedule | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSchedule;
    if (!parsed.dataUrl || !parsed.mimeType) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSchedule(schedule: StoredSchedule): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export function clearSchedule(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isPdf(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
