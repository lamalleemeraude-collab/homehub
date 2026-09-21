import dynamic from "next/dynamic";
import { HubRouteSkeleton } from "@/components/ui/HubRouteSkeleton";

const MealsView = dynamic(
  () =>
    import("@/components/meals/MealsView").then((m) => ({
      default: m.MealsView,
    })),
  { loading: () => <HubRouteSkeleton /> }
);

export default function RepasPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <MealsView />
    </div>
  );
}
