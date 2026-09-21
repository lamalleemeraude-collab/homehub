import dynamic from "next/dynamic";
import { HubRouteSkeleton } from "@/components/ui/HubRouteSkeleton";

const ShoppingView = dynamic(
  () =>
    import("@/components/shopping/ShoppingView").then((m) => ({
      default: m.ShoppingView,
    })),
  { loading: () => <HubRouteSkeleton /> }
);

export default function ShoppingPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ShoppingView />
    </div>
  );
}
