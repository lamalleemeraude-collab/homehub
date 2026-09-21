"use client";

import { useState } from "react";
import { CalendarDays, GraduationCap, List } from "lucide-react";
import { AgendaTimeline } from "@/components/calendar/AgendaTimeline";
import { CalendarSourcesStatus } from "@/components/calendar/CalendarSourcesStatus";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { BentoCard } from "@/components/ui/BentoCard";
import { HubPageHeader } from "@/components/ui/HubPageHeader";
import { HubSegmentedControl } from "@/components/ui/HubSegmentedControl";
import { PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";

type CalendarTab = "agenda" | "month" | "schedule";

const TAB_SUBTITLES: Record<CalendarTab, string> = {
  agenda: "Fil chronologique · 14 prochains jours",
  month: "Vue mensuelle",
  schedule: "Vue semaine par agenda",
};

export function CalendarView() {
  const [tab, setTab] = useState<CalendarTab>("agenda");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <HubPageHeader
        accent="calendar"
        icon={CalendarDays}
        eyebrow="Famille & collège"
        title="Calendrier"
        subtitle={TAB_SUBTITLES[tab]}
        actions={
          <HubSegmentedControl
            value={tab}
            onChange={setTab}
            segments={[
              { id: "agenda", label: "Agenda", icon: List },
              { id: "month", label: "Mois", icon: CalendarDays },
              { id: "schedule", label: "Semaine", icon: GraduationCap },
            ]}
          />
        }
      />

      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.calendar}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {tab === "agenda" ? (
          <AgendaTimeline />
        ) : tab === "month" ? (
          <MonthlyCalendar />
        ) : (
          <WeeklyCalendar />
        )}
      </BentoCard>

      <CalendarSourcesStatus />
    </div>
  );
}
