import dynamic from "next/dynamic";
import { HubRouteSkeleton } from "@/components/ui/HubRouteSkeleton";

const HouseView = dynamic(
  () =>
    import("@/components/house/HouseView").then((m) => ({
      default: m.HouseView,
    })),
  { loading: () => <HubRouteSkeleton /> }
);

export default function HousePage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <HouseView />
    </div>
  );
}
