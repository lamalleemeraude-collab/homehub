import dynamic from "next/dynamic";
import { HubRouteSkeleton } from "@/components/ui/HubRouteSkeleton";

const ScheduleView = dynamic(
  () =>
    import("@/components/schedule/ScheduleView").then((m) => ({
      default: m.ScheduleView,
    })),
  { loading: () => <HubRouteSkeleton /> }
);

export default function EmploiDuTempsPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ScheduleView />
    </div>
  );
}
