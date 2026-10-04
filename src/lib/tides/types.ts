export type TideKind = "high" | "low";

export type TideScheduleRaw = {
  iso: string;
  type: TideKind;
  heightM: number;
  coefficient?: number;
};

export type TideEvent = {
  time: Date;
  type: TideKind;
  label: string;
  heightM: number;
  coefficient?: number;
};

export type TideSnapshot = {
  ok: true;
  port: string;
  source: string;
  sourceUrl: string;
  syncedAt: string;
  events: TideScheduleRaw[];
};

export type TideSnapshotError = {
  ok: false;
  error: string;
  events?: TideScheduleRaw[];
};
