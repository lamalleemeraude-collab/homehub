import { ShoppingCart } from "lucide-react";
import { HubPageHeader } from "@/components/ui/HubPageHeader";
import { ShoppingList } from "./ShoppingList";

export function ShoppingView() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 sm:gap-3">
      <HubPageHeader
        accent="shopping"
        icon={ShoppingCart}
        eyebrow="Supermarché"
        title="Liste de courses"
        subtitle="Touche pour cocher — comme au magasin"
      />

      <ShoppingList />
    </div>
  );
}
