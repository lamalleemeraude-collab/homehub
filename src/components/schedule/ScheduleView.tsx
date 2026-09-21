"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDown, FileImage, GraduationCap, Trash2, Upload } from "lucide-react";
import {
  TimetableWidget,
  type TimetableWidgetHandle,
} from "@/components/schedule/TimetableWidget";
import { BentoCard } from "@/components/ui/BentoCard";
import { HubPageHeader } from "@/components/ui/HubPageHeader";
import { TouchButton } from "@/components/ui/TouchButton";
import { FILLED_CTA, PASTEL_GRADIENTS, SOFT_CTA } from "@/lib/ui/pastel-theme";
import { SCHEDULE_META } from "@/lib/schedule/scheduleData";
import {
  clearSchedule,
  isImage,
  isPdf,
  loadSchedule,
  saveSchedule,
  type StoredSchedule,
} from "@/lib/schedule-storage";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf";

export function ScheduleView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timetableRef = useRef<TimetableWidgetHandle>(null);
  const [schedule, setSchedule] = useState<StoredSchedule | null>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showScan, setShowScan] = useState(false);

  useEffect(() => {
    setSchedule(loadSchedule());
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const allowed =
      isPdf(file.type) ||
      isImage(file.type) ||
      /\.(pdf|png|jpe?g|webp)$/i.test(file.name);

    if (!allowed) return;

    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const stored: StoredSchedule = {
        fileName: file.name,
        mimeType: file.type || guessMime(file.name),
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      saveSchedule(stored);
      setSchedule(stored);
    } finally {
      setUploading(false);
    }
  }, []);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  function removeSchedule() {
    clearSchedule();
    setSchedule(null);
  }

  async function handleExportPdf() {
    setExporting(true);
    try {
      await timetableRef.current?.exportPdf();
    } catch (error) {
      console.error("[export-pdf]", error);
      window.alert("Impossible de générer le PDF. Réessaie dans un instant.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <HubPageHeader
        accent="school"
        icon={GraduationCap}
        eyebrow="Collège Sainte-Marie"
        title="Emploi du temps"
        subtitle={`${SCHEDULE_META.student} — ${SCHEDULE_META.grade} · ${SCHEDULE_META.schoolYear}`}
        actions={
          <>
            {!showScan && (
              <TouchButton
                ariaLabel="Enregistrer l'emploi du temps en PDF A4 paysage"
                onClick={() => void handleExportPdf()}
                disabled={exporting}
                className={`flex min-h-[44px] items-center gap-2 rounded-2xl px-3 text-sm font-bold disabled:opacity-60 sm:min-h-[48px] sm:px-4 sm:text-base ${SOFT_CTA.school}`}
              >
                <FileDown className="h-5 w-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">
                  {exporting ? "PDF…" : "PDF A4"}
                </span>
              </TouchButton>
            )}
            <TouchButton
              ariaLabel={showScan ? "Voir l'emploi du temps" : "Voir le scan importé"}
              onClick={() => setShowScan((v) => !v)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                showScan
                  ? FILLED_CTA.bag
                  : "border border-white/60 bg-white/70 text-slate-600 shadow-sm active:bg-white"
              }`}
            >
              <FileImage className="h-5 w-5" strokeWidth={2.5} />
            </TouchButton>
            {schedule && (
              <TouchButton
                ariaLabel="Supprimer l'emploi du temps"
                onClick={removeSchedule}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-500 shadow-sm active:bg-rose-50 active:text-rose-600 sm:h-12 sm:w-12"
              >
                <Trash2 className="h-5 w-5" strokeWidth={2.5} />
              </TouchButton>
            )}
            <TouchButton
              ariaLabel="Importer l'emploi du temps"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={`flex min-h-[44px] items-center gap-2 rounded-2xl px-4 text-sm font-bold disabled:opacity-60 sm:min-h-[48px] sm:px-5 sm:text-base ${FILLED_CTA.bag}`}
            >
              <Upload className="h-5 w-5" strokeWidth={2.5} />
              {uploading ? "Import…" : schedule ? "Remplacer" : "Importer"}
            </TouchButton>
          </>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={onInputChange}
      />

      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.school}
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4"
      >
        {showScan ? (
          schedule ? (
            <SchedulePreview schedule={schedule} />
          ) : (
            <EmptySchedule onImport={() => inputRef.current?.click()} />
          )
        ) : (
          <TimetableWidget ref={timetableRef} />
        )}
      </BentoCard>
    </div>
  );
}

function EmptySchedule({ onImport }: { onImport: () => void }) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/60 bg-white/70 shadow-sm">
        <GraduationCap className="h-10 w-10 text-sky-500" strokeWidth={2} />
      </div>
      <div>
        <p className="text-xl font-black text-slate-800 sm:text-2xl">
          Pas encore d&apos;emploi du temps
        </p>
        <p className="mt-2 max-w-md text-base font-semibold text-slate-500">
          Importe une photo ou un PDF depuis la tablette — il s&apos;affichera
          ici en plein écran.
        </p>
      </div>
      <TouchButton
        ariaLabel="Importer l'emploi du temps"
        onClick={onImport}
        className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-8 text-lg font-bold ${FILLED_CTA.bag}`}
      >
        <Upload className="h-6 w-6" strokeWidth={2.5} />
        Importer l&apos;emploi du temps
      </TouchButton>
    </div>
  );
}

function SchedulePreview({ schedule }: { schedule: StoredSchedule }) {
  if (isPdf(schedule.mimeType)) {
    return (
      <iframe
        src={schedule.dataUrl}
        title={schedule.fileName}
        className="h-full min-h-0 w-full flex-1 border-0 bg-white"
      />
    );
  }

  if (isImage(schedule.mimeType)) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-hidden bg-slate-50 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={schedule.dataUrl}
          alt={schedule.fileName}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <p className="p-8 text-center font-semibold text-slate-500">
      Format non supporté
    </p>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function guessMime(name: string): string {
  if (/\.pdf$/i.test(name)) return "application/pdf";
  if (/\.png$/i.test(name)) return "image/png";
  if (/\.webp$/i.test(name)) return "image/webp";
  return "image/jpeg";
}
