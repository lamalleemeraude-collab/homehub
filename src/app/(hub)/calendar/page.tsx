import dynamic from "next/dynamic";
import { HubRouteSkeleton } from "@/components/ui/HubRouteSkeleton";

const CalendarView = dynamic(
  () =>
    import("@/components/calendar/CalendarView").then((m) => ({
      default: m.CalendarView,
    })),
  { loading: () => <HubRouteSkeleton /> }
);

export default function CalendarPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <CalendarView />
    </div>
  );
}
