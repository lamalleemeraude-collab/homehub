import { jsPDF } from "jspdf";
import {
  DAY_NAMES,
  SCHEDULE_META,
  TIME_SLOTS,
  TIMETABLE_BREAKS,
  WEEKLY_SCHEDULE,
  type SubjectColor,
  type TimetableBreak,
  type TimetableCell,
  type WeekDay,
} from "./scheduleData";
import { cellRowSpan, isSpannedSlot } from "./timetable-queries";

/** Couleurs hex pour jsPDF (html2canvas ne gère pas les couleurs lab() de Tailwind v4). */
const PDF_FILL: Record<SubjectColor, [number, number, number]> = {
  maths: [207, 250, 254],
  francais: [252, 231, 243],
  anglais: [219, 234, 254],
  "histoire-geo": [254, 243, 199],
  eps: [236, 252, 203],
  sciences: [250, 232, 255],
  arts: [220, 252, 231],
  musique: [236, 252, 203],
  allemand: [220, 252, 231],
  perm: [226, 232, 240],
  devf: [252, 231, 243],
  accompagnement: [255, 237, 213],
  cate: [255, 237, 213],
  self: [241, 245, 249],
  "vie-classe": [254, 249, 195],
};

const HEADER_BG: [number, number, number] = [51, 65, 85];
const TIME_BG: [number, number, number] = [248, 250, 252];
const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [203, 213, 225];

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function breaksAfterSlot(slotIndex: number): TimetableBreak[] {
  return TIMETABLE_BREAKS.filter((b) => b.afterSlotIndex === slotIndex);
}

function cellLines(cell: TimetableCell): string[] {
  if (cell.variants && cell.variants.length > 0) {
    const lines: string[] = [];
    for (const variant of cell.variants) {
      lines.push(variant.shortLabel);
      const meta = [variant.teacher, variant.room].filter(Boolean).join(" · ");
      if (meta) lines.push(meta);
    }
    return lines.slice(0, 5);
  }

  const lines = [cell.shortLabel];
  const meta = [cell.teacher, cell.room].filter(Boolean).join(" · ");
  if (meta) lines.push(meta);
  return lines;
}

function fillRgb(
  pdf: jsPDF,
  rgb: [number, number, number]
): void {
  pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function strokeRgb(
  pdf: jsPDF,
  rgb: [number, number, number]
): void {
  pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function textRgb(
  pdf: jsPDF,
  rgb: [number, number, number]
): void {
  pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function drawCellText(
  pdf: jsPDF,
  lines: string[],
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const padding = 1.2;
  const lineHeight = 3.2;
  let cursorY = y + padding + 2.5;
  const maxY = y + h - padding;

  for (const line of lines) {
    if (cursorY > maxY) break;
    const wrapped = pdf.splitTextToSize(line, w - padding * 2) as string[];
    for (const part of wrapped) {
      if (cursorY > maxY) break;
      pdf.text(part, x + padding, cursorY);
      cursorY += lineHeight;
    }
  }
}

export async function exportTimetablePdf(): Promise<void> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentW = pageW - margin * 2;

  const timeColW = 22;
  const dayColW = (contentW - timeColW) / 5;
  const titleH = 14;
  const headerH = 9;
  const breakH = 6;
  const breakCount = TIMETABLE_BREAKS.length;
  const slotCount = TIME_SLOTS.length;
  const gridTop = margin + titleH;
  const gridH = pageH - gridTop - margin - headerH;
  const slotRowH = (gridH - breakCount * breakH) / slotCount;

  let y = margin;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  textRgb(pdf, TEXT_DARK);
  pdf.text(`Emploi du temps — ${SCHEDULE_META.grade}`, margin, y + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  textRgb(pdf, TEXT_MUTED);
  pdf.text(
    `${SCHEDULE_META.college} · ${SCHEDULE_META.student} · ${SCHEDULE_META.schoolYear}`,
    margin,
    y + 10
  );

  y = gridTop;

  fillRgb(pdf, HEADER_BG);
  strokeRgb(pdf, BORDER);
  pdf.rect(margin, y, contentW, headerH, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Horaire", margin + 2, y + 5.5);

  ([1, 2, 3, 4, 5] as WeekDay[]).forEach((day, i) => {
    const x = margin + timeColW + i * dayColW;
    pdf.text(DAY_NAMES[day], x + dayColW / 2, y + 5.5, { align: "center" });
  });

  y += headerH;

  TIME_SLOTS.forEach((slot, slotIndex) => {
    const rowH = slotRowH;

    fillRgb(pdf, TIME_BG);
    strokeRgb(pdf, BORDER);
    pdf.rect(margin, y, timeColW, rowH, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6);
    textRgb(pdf, TEXT_DARK);
    pdf.text(slot.start, margin + 2, y + 4);
    pdf.setFont("helvetica", "normal");
    textRgb(pdf, TEXT_MUTED);
    pdf.text(slot.end, margin + 2, y + 7.5);

    ([1, 2, 3, 4, 5] as WeekDay[]).forEach((day, dayIndex) => {
      if (isSpannedSlot(day, slotIndex)) return;

      const cell = WEEKLY_SCHEDULE[day][slotIndex];
      const rowSpan = cellRowSpan(cell);
      const cellH = rowH * rowSpan;
      const x = margin + timeColW + dayIndex * dayColW;

      if (cell) {
        const fill = PDF_FILL[cell.color] ?? PDF_FILL.perm;
        fillRgb(pdf, fill);
      } else {
        fillRgb(pdf, [249, 250, 251]);
      }

      strokeRgb(pdf, BORDER);
      pdf.rect(x, y, dayColW, cellH, "FD");

      if (cell) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(5.5);
        textRgb(pdf, TEXT_DARK);
        drawCellText(pdf, cellLines(cell), x, y, dayColW, cellH);
      }
    });

    y += rowH;

    for (const breakItem of breaksAfterSlot(slotIndex)) {
      const isLunch = breakItem.kind === "lunch";
      fillRgb(pdf, isLunch ? [255, 251, 235] : [240, 249, 255]);
      strokeRgb(pdf, BORDER);
      pdf.rect(margin, y, contentW, breakH, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      textRgb(pdf, isLunch ? [146, 64, 14] : [12, 74, 110]);
      pdf.text(breakItem.label, margin + 2, y + 4);
      pdf.text(breakItem.title.toUpperCase(), margin + timeColW, y + 4);

      y += breakH;
    }
  });

  const baseName = sanitizeFilename(
    `emploi-du-temps-${SCHEDULE_META.student}-${SCHEDULE_META.schoolYear}`
  );
  pdf.save(`${baseName || "emploi-du-temps"}.pdf`);
}

/** @deprecated Utiliser exportTimetablePdf() sans argument DOM. */
export async function exportTimetablePdfFromElement(
  _element: HTMLElement
): Promise<void> {
  return exportTimetablePdf();
}
