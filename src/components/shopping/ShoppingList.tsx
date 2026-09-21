"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Maximize,
  Minimize,
  Plus,
  Save,
  Upload,
  UtensilsCrossed,
} from "lucide-react";
import { AddProductOverlay } from "@/components/shopping/AddProductOverlay";
import { ShoppingItemTile } from "@/components/shopping/ShoppingItemTile";
import { BentoCard } from "@/components/ui/BentoCard";
import { TouchButton } from "@/components/ui/TouchButton";
import { useFullscreen } from "@/hooks/useFullscreen";
import { FILLED_CTA, PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";
import { getShoppingGridLayout } from "@/lib/shopping-grid";
import {
  CATEGORY_ORDER,
  QUICK_ADD_ITEMS,
  createShoppingItem,
  initialShoppingItems,
  type ShoppingItem,
} from "@/lib/shopping-categories";
import {
  exportShoppingListJson,
  exportShoppingListText,
  loadShoppingItems,
  parseShoppingListJson,
  saveShoppingItems,
} from "@/lib/shopping-storage";
import { mealIngredientsToShoppingItems } from "@/lib/meals/to-shopping";

function sortItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    const cat =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (cat !== 0) return cat;
    return a.label.localeCompare(b.label, "fr");
  });
}

export function ShoppingList() {
  const { isFullscreen, supported, toggle } = useFullscreen();
  const importRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ShoppingItem[]>(initialShoppingItems);
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadShoppingItems();
    if (saved) setItems(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveShoppingItems(items);
    setSaveHint("Liste sauvegardée");
    const timer = setTimeout(() => setSaveHint(null), 2000);
    return () => clearTimeout(timer);
  }, [items, hydrated]);

  const sortedItems = useMemo(() => sortItems(items), [items]);
  const gridLayout = useMemo(
    () => getShoppingGridLayout(sortedItems.length),
    [sortedItems.length]
  );
  const remaining = sortedItems.filter((i) => !i.checked).length;

  function importFromMeals() {
    setItems((prev) => {
      const added = mealIngredientsToShoppingItems(prev);
      if (added.length === 0) return prev;
      return sortItems([...prev, ...added]);
    });
  }

  function addItem(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;

    setItems((prev) => [...prev, createShoppingItem(trimmed)]);
    setDraft("");
    setAdding(false);
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function openAdd() {
    setDraft("");
    setAdding(true);
  }

  function handleImport(file: File) {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === "string" ? reader.result : "";
      const imported = parseShoppingListJson(content);
      if (!imported) {
        setImportError("Fichier invalide — utilise une sauvegarde .json");
        return;
      }
      setItems(imported);
    };
    reader.readAsText(file);
  }

  function onImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    e.target.value = "";
  }

  return (
    <>
      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.shopping}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/40 px-4 py-3">
          <TouchButton
            ariaLabel="Ajouter un produit"
            onClick={openAdd}
            className={`flex min-h-[52px] shrink-0 items-center gap-2 rounded-2xl px-5 text-base font-bold sm:min-h-[56px] sm:px-6 sm:text-lg ${FILLED_CTA.shopping}`}
          >
            <Plus className="h-6 w-6" strokeWidth={3} />
            Nouveau
          </TouchButton>

          <TouchButton
            ariaLabel="Importer les ingrédients des repas"
            onClick={importFromMeals}
            className="flex min-h-[52px] shrink-0 items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 text-sm font-bold text-orange-900 shadow-sm active:bg-white sm:min-h-[56px] sm:px-5 sm:text-base"
          >
            <UtensilsCrossed className="h-5 w-5" strokeWidth={2.5} />
            Repas
          </TouchButton>

          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5">
            {QUICK_ADD_ITEMS.map((label) => (
              <TouchButton
                key={label}
                ariaLabel={`Ajouter ${label}`}
                onClick={() => addItem(label)}
                className="shrink-0 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-sm font-bold text-orange-900 shadow-sm active:bg-white sm:px-4 sm:text-base"
              >
                + {label}
              </TouchButton>
            ))}
          </div>

          <TouchButton
            ariaLabel="Exporter la liste en texte"
            onClick={() => exportShoppingListText(items)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 shadow-sm active:bg-white sm:h-12 sm:w-12"
          >
            <Download className="h-5 w-5" strokeWidth={2.5} />
          </TouchButton>

          <TouchButton
            ariaLabel="Sauvegarder un fichier de secours"
            onClick={() => exportShoppingListJson(items)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 shadow-sm active:bg-white sm:h-12 sm:w-12"
          >
            <Save className="h-5 w-5" strokeWidth={2.5} />
          </TouchButton>

          <TouchButton
            ariaLabel="Importer une sauvegarde"
            onClick={() => importRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 shadow-sm active:bg-white sm:h-12 sm:w-12"
          >
            <Upload className="h-5 w-5" strokeWidth={2.5} />
          </TouchButton>

          {supported && (
            <TouchButton
              ariaLabel={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              onClick={toggle}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 shadow-sm active:bg-white sm:h-12 sm:w-12"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <Maximize className="h-5 w-5" strokeWidth={2.5} />
              )}
            </TouchButton>
          )}

          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={onImportChange}
          />
        </div>

        <div className="flex shrink-0 items-center justify-between px-4 py-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-400 sm:text-base">
              {remaining} article{remaining !== 1 ? "s" : ""} restant
              {remaining !== 1 ? "s" : ""}
            </p>
            {saveHint && (
              <p className="text-xs font-semibold text-emerald-600">{saveHint}</p>
            )}
            {importError && (
              <p className="text-xs font-semibold text-red-600">{importError}</p>
            )}
          </div>
          <p className="shrink-0 text-xs font-semibold text-slate-400">
            Touche pour cocher · ✕ pour supprimer
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-3 pt-0 sm:p-4 sm:pt-0">
          {sortedItems.length === 0 || !gridLayout ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-xl font-black text-slate-300 sm:text-2xl">
                Liste vide — appuie sur Nouveau
              </p>
            </div>
          ) : (
            <div
              className={`grid h-full min-h-0 ${gridLayout.gapClass}`}
              style={{
                gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
              }}
            >
              {sortedItems.map((item) => (
                <ShoppingItemTile
                  key={item.id}
                  item={item}
                  layout={gridLayout}
                  onToggle={() => toggleItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </BentoCard>

      {adding && (
        <AddProductOverlay
          value={draft}
          onChange={setDraft}
          onSubmit={() => addItem(draft)}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}
