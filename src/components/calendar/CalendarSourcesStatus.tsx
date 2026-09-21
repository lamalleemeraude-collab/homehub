"use client";

import {
  useCalendarEvents,
  type CalendarSourceStatus,
} from "@/hooks/useCalendarEvents";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";
import { EVENT_TYPE_STYLES } from "@/lib/hub-events";
import type { HubEventType } from "@/lib/hub-events";

const SOURCE_TYPE: Record<string, HubEventType> = {
  maelle: "maelle",
  papa: "papa",
  roulle: "roulle",
};

function SourceChip({ source }: { source: CalendarSourceStatus }) {
  const linked = source.configured && !source.error;
  const type = SOURCE_TYPE[source.id];
  const dotClass = type ? EVENT_TYPE_STYLES[type].dot : "bg-slate-300";

  return (
    <div
      className="flex items-center gap-1.5"
      title={source.iphoneName}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${dotClass}`} />
      <span className="text-xs font-medium text-slate-600 sm:text-sm">
        {source.label}
      </span>
      {linked && (
        <span className="text-xs text-slate-400">{source.eventCount}</span>
      )}
      {!linked && (
        <span className="text-xs font-medium text-slate-400">!</span>
      )}
    </div>
  );
}

export function CalendarSourcesStatus() {
  const { sources, syncStatus } = useCalendarEvents();
  const webhook = useWebhookCalendarEvents();

  if (sources.length === 0 && syncStatus === "idle") return null;

  const exchangePending = sources.some(
    (s) => s.account === "Exchange" && !s.configured
  );

  return (
    <footer className="shrink-0 border-t border-slate-100 pt-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
        {sources.map((source) => (
          <SourceChip key={source.id} source={source} />
        ))}
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-sm ${EVENT_TYPE_STYLES.reminder.dot}`}
          />
          <span className="text-xs font-medium text-slate-600 sm:text-sm">
            {EVENT_TYPE_STYLES.reminder.label}
          </span>
        </div>
        {webhook.events.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-sky-400/80" />
            <span className="text-xs font-medium text-slate-600 sm:text-sm">
              iPhone (webhook)
            </span>
            <span className="text-xs text-slate-400">{webhook.events.length}</span>
          </div>
        )}
        <span className="ml-auto text-[11px] text-slate-400">synchro auto</span>
      </div>
      {exchangePending && (
        <p className="mt-1.5 px-1 text-xs text-slate-500">
          Exchange : configure ROULLE_CALENDAR_URL dans .env.local
        </p>
      )}
    </footer>
  );
}
