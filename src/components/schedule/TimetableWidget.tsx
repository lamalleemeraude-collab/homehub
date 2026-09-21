"use client";

import {
  forwardRef,
  Fragment,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  DAY_NAMES,
  GROUP_BADGE,
  SCHEDULE_META,
  SUBJECT_COLORS,
  TIME_SLOTS,
  TIMETABLE_BREAKS,
  WEEKLY_SCHEDULE,
  type CellVariant,
  type TimetableBreak,
  type TimetableCell,
  type WeekDay,
} from "@/lib/schedule/scheduleData";
import { exportTimetablePdf } from "@/lib/schedule/export-timetable-pdf";
import {
  cellRowSpan,
  getTodayDayIndex,
  isSpannedSlot,
} from "@/lib/schedule/timetable-queries";

export type TimetableWidgetHandle = {
  exportPdf: () => Promise<void>;
};

function VariantBlock({ variant }: { variant: CellVariant }) {
  const style = SUBJECT_COLORS[variant.color];
  return (
    <div
      className={`flex h-full min-w-0 flex-1 flex-col justify-center rounded-lg border px-1 py-1 md:px-1.5 ${style.tile}`}
    >
      {variant.group && (
        <span
          className={`mb-0.5 inline-block w-fit rounded px-1 py-px text-[9px] font-black leading-none md:text-[10px] ${GROUP_BADGE[variant.group]}`}
        >
          {variant.group}
        </span>
      )}
      <p
        className={`text-[9px] font-black leading-tight md:text-[10px] lg:text-xs ${style.text}`}
      >
        {variant.shortLabel}
      </p>
      {variant.track && (
        <p className="mt-0.5 truncate text-[8px] font-bold leading-tight text-slate-700 md:text-[9px]">
          {variant.track}
        </p>
      )}
      {(variant.teacher || variant.room) && (
        <p className="mt-0.5 truncate text-[8px] font-semibold leading-tight text-slate-600 md:text-[9px]">
          {[variant.teacher, variant.room].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

function CellContent({ cell }: { cell: TimetableCell }) {
  const style = SUBJECT_COLORS[cell.color];

  if (cell.variants && cell.variants.length > 0) {
    return (
      <div className="flex h-full gap-0.5 md:gap-1">
        {cell.variants.map((variant, i) => (
          <VariantBlock
            key={`${variant.shortLabel}-${variant.teacher ?? ""}-${variant.track ?? ""}-${i}`}
            variant={variant}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-0.5">
      <p
        className={`text-[10px] font-black leading-tight md:text-xs lg:text-sm ${style.text}`}
      >
        {cell.shortLabel}
      </p>
      {cell.track && (
        <p className="truncate text-[8px] font-bold text-slate-700 md:text-[9px]">
          {cell.track}
        </p>
      )}
      {(cell.teacher || cell.room) && (
        <p className="truncate text-[8px] font-semibold text-slate-600 md:text-[9px]">
          {[cell.teacher, cell.room].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

function TimetableCellBox({ cell }: { cell: TimetableCell }) {
  const style = SUBJECT_COLORS[cell.color];
  return (
    <div
      className={`h-full rounded-lg border p-1 md:rounded-xl md:p-1.5 ${style.tile}`}
    >
      <CellContent cell={cell} />
    </div>
  );
}

function breakStyles(kind: TimetableBreak["kind"]) {
  if (kind === "lunch") {
    return {
      row: "bg-amber-50",
      border: "border-amber-300",
      time: "text-amber-950",
      title: "text-amber-950",
    };
  }
  return {
    row: "bg-sky-50",
    border: "border-sky-300",
    time: "text-sky-950",
    title: "text-sky-950",
  };
}

function BreakRow({ breakItem }: { breakItem: TimetableBreak }) {
  const styles = breakStyles(breakItem.kind);
  return (
    <tr className={`${styles.row} h-7 md:h-8`}>
      <td
        className={`border px-1.5 py-1 align-middle md:px-2 ${styles.border}`}
      >
        <p
          className={`text-[10px] font-bold tabular-nums md:text-xs ${styles.time}`}
        >
          {breakItem.label}
        </p>
      </td>
      <td
        colSpan={5}
        className={`border px-2 py-1 text-center md:px-3 ${styles.border}`}
      >
        <p
          className={`text-[10px] font-black uppercase tracking-wide md:text-xs ${styles.title}`}
        >
          {breakItem.title}
        </p>
      </td>
    </tr>
  );
}

function breaksAfterSlot(slotIndex: number): TimetableBreak[] {
  return TIMETABLE_BREAKS.filter((b) => b.afterSlotIndex === slotIndex);
}

export const TimetableWidget = forwardRef<TimetableWidgetHandle>(
  function TimetableWidget(_props, ref) {
    const todayIndex = getTodayDayIndex();
    const exportRootRef = useRef<HTMLDivElement>(null);

    const rows = useMemo(
      () =>
        TIME_SLOTS.map((slot, index) => ({
          slot,
          index,
          cells: ([1, 2, 3, 4, 5] as WeekDay[]).map((day) => ({
            day,
            cell: WEEKLY_SCHEDULE[day][index] ?? null,
          })),
        })),
      []
    );

    useImperativeHandle(ref, () => ({
      exportPdf: async () => {
        await exportTimetablePdf();
      },
    }));

    return (
      <div className="flex h-full min-h-0 flex-col gap-2 md:gap-3">
        <div className="shrink-0 px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 md:text-sm">
            {SCHEDULE_META.student} · {SCHEDULE_META.grade}
          </p>
          <p className="text-sm font-semibold text-slate-600 md:text-base">
            {SCHEDULE_META.college} · {SCHEDULE_META.schoolYear}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain md:overflow-hidden">
          <div
            ref={exportRootRef}
            className="timetable-export-root flex h-full min-h-0 min-w-[640px] flex-col bg-white md:min-w-0"
          >
            <div className="timetable-export-only mb-2 shrink-0 px-1">
              <p className="text-lg font-black text-slate-800">
                Emploi du temps — {SCHEDULE_META.grade}
              </p>
              <p className="text-sm font-semibold text-slate-600">
                {SCHEDULE_META.college} · {SCHEDULE_META.schoolYear}
              </p>
            </div>

            <table className="h-full w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="w-[4.5rem] border border-slate-600 px-1 py-1.5 text-left text-[10px] font-bold uppercase tracking-wide md:w-24 md:px-2 md:text-xs">
                    Horaire
                  </th>
                  {([1, 2, 3, 4, 5] as WeekDay[]).map((day) => (
                    <th
                      key={day}
                      className={`border border-slate-600 px-1 py-1.5 text-center text-[11px] font-black md:px-2 md:text-sm ${
                        day === todayIndex ? "bg-emerald-700" : ""
                      }`}
                    >
                      <span className="hidden sm:inline">{DAY_NAMES[day]}</span>
                      <span className="sm:hidden">
                        {DAY_NAMES[day].slice(0, 3)}
                      </span>
                      {day === todayIndex && (
                        <span className="ml-0.5 text-[9px] font-bold opacity-90 md:text-[10px]">
                          ·
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="h-full">
                {rows.map(({ slot, index, cells }) => (
                  <Fragment key={slot.id}>
                    <tr className="h-[calc((100%-6rem)/7)] min-h-[2.6rem] md:min-h-0">
                      <td className="border border-slate-200 bg-slate-50 px-1 py-0.5 align-middle md:px-2">
                        <p className="text-[9px] font-bold leading-tight tabular-nums text-slate-700 md:text-[11px]">
                          <span className="block">{slot.start}</span>
                          <span className="block text-slate-400">
                            {slot.end}
                          </span>
                        </p>
                      </td>
                      {cells.map(({ day, cell }) => {
                        if (isSpannedSlot(day, index)) return null;
                        const rowSpan = cellRowSpan(cell);

                        return (
                          <td
                            key={day}
                            rowSpan={rowSpan > 1 ? rowSpan : undefined}
                            className="border border-slate-200 p-0.5 align-stretch md:p-1"
                          >
                            {cell ? (
                              <TimetableCellBox cell={cell} />
                            ) : (
                              <div className="h-full min-h-[2.4rem] rounded-lg bg-slate-50/70 md:min-h-0" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {breaksAfterSlot(index).map((breakItem) => (
                      <BreakRow key={breakItem.id} breakItem={breakItem} />
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="shrink-0 px-1 text-center text-[10px] font-semibold text-slate-400 md:hidden">
          Glisse horizontalement pour voir toute la semaine
        </p>
      </div>
    );
  }
);
