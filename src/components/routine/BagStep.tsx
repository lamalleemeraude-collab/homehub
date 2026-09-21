"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronDown, Plus } from "lucide-react";
import { BagItemRow } from "@/components/routine/BagItemRow";
import { BagSubjectChip } from "@/components/routine/BagSubjectChip";
import { TouchButton } from "@/components/ui/TouchButton";
import { bagItemsForTomorrow } from "@/lib/bag-for-schedule";
import { getBagSubjectGroups } from "@/lib/bag-subject-groups";
import { SUPPLIES_PDF_PATH } from "@/lib/bag-packing-engine";
import { formatTomorrowLabel } from "@/lib/tomorrow-schedule";
import {
  BAG_CATEGORY_META,
  categorizeBagItem,
  createBagItem,
  type BagSupplyItem,
} from "@/lib/bag-supplies";

type BagStepProps = {
  checked: Set<string>;
  onToggle: (id: string) => void;
  onCheckMany: (ids: string[]) => void;
  onFinish: () => void;
};

function groupProgress(group: { items: { id: string }[] }, checked: Set<string>) {
  const done = group.items.filter((i) => checked.has(i.id)).length;
  return { done, total: group.items.length };
}

function firstIncompleteGroupId(
  groups: { id: string; items: { id: string }[] }[],
  checked: Set<string>
): string {
  const incomplete = groups.find((g) => {
    const { done, total } = groupProgress(g, checked);
    return total > 0 && done < total;
  });
  return incomplete?.id ?? groups[0]?.id ?? "permanent";
}

export function BagStep({
  checked,
  onToggle,
  onCheckMany,
  onFinish,
}: BagStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [customItems, setCustomItems] = useState<BagSupplyItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const scheduleInfo = useMemo(() => bagItemsForTomorrow(), []);

  const subjectGroups = useMemo(
    () => getBagSubjectGroups(scheduleInfo.bagTags),
    [scheduleInfo.bagTags]
  );

  const customGroup = useMemo(() => {
    if (customItems.length === 0) return null;
    return {
      id: "custom",
      label: "Ajouts",
      emoji: "➕",
      tags: [],
      items: customItems.map((item) => ({
        ...item,
        reason: "",
        essential: false,
      })),
    };
  }, [customItems]);

  const allGroups = useMemo(
    () => (customGroup ? [...subjectGroups, customGroup] : subjectGroups),
    [subjectGroups, customGroup]
  );

  const allItems = useMemo(
    () => [
      ...scheduleInfo.items,
      ...customItems.map((item) => ({ ...item, reason: "", essential: false })),
    ],
    [scheduleInfo.items, customItems]
  );

  const activeGroupId = selectedGroupId ?? firstIncompleteGroupId(allGroups, checked);
  const activeGroup =
    allGroups.find((g) => g.id === activeGroupId) ?? allGroups[0];

  useEffect(() => {
    if (!selectedGroupId && allGroups.length > 0) {
      setSelectedGroupId(firstIncompleteGroupId(allGroups, checked));
    }
  }, [allGroups, checked, selectedGroupId]);

  const checkedCount = allItems.filter((i) => checked.has(i.id)).length;
  const allChecked = allItems.length > 0 && checkedCount === allItems.length;
  const progress = allItems.length
    ? Math.round((checkedCount / allItems.length) * 100)
    : 0;

  function addCustomItem() {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setCustomItems((prev) => [...prev, createBagItem(trimmed)]);
    setInputValue("");
    setSelectedGroupId("custom");
    setShowAddForm(false);
  }

  function handleGroupCheckAll() {
    if (!activeGroup) return;
    onCheckMany(activeGroup.items.map((i) => i.id));
    const nextId = firstIncompleteGroupId(
      allGroups.filter((g) => g.id !== activeGroup.id),
      new Set([...checked, ...activeGroup.items.map((i) => i.id)])
    );
    if (nextId) setSelectedGroupId(nextId);
  }

  if (scheduleInfo.isWeekend) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <span className="text-6xl">🌴</span>
        <h2 className="text-3xl font-black text-slate-800">Pas de cours demain</h2>
        <p className="max-w-md text-lg font-semibold text-slate-500">
          Week-end — pas besoin de préparer le sac scolaire.
        </p>
        <Link
          href="/"
          className="touch-target rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-black text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const activeProgress = activeGroup
    ? groupProgress(activeGroup, checked)
    : { done: 0, total: 0 };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <div className="shrink-0">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-slate-800 sm:text-3xl">
              Préparer le sac
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500 sm:text-base">
              {formatTomorrowLabel()} ·{" "}
              <a
                href={SUPPLIES_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline"
              >
                liste fournitures
              </a>
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-slate-500">
            {checkedCount}/{allItems.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/50">
          <div
            className="h-full rounded-full bg-teal-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="-mx-1 shrink-0 overflow-x-auto px-1 pb-1">
        <div className="flex gap-2">
          {allGroups.map((group) => {
            const { done, total } = groupProgress(group, checked);
            return (
              <BagSubjectChip
                key={group.id}
                group={group}
                selected={group.id === activeGroupId}
                done={done}
                total={total}
                onSelect={() => setSelectedGroupId(group.id)}
              />
            );
          })}
        </div>
      </div>

      {activeGroup && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between gap-2 px-0.5">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 sm:text-xl">
                <span>{activeGroup.emoji}</span>
                <span className="truncate">{activeGroup.label}</span>
                {"time" in activeGroup && activeGroup.time && (
                  <span className="rounded-lg bg-white/60 px-2 py-0.5 text-sm font-bold tabular-nums text-slate-500 ring-1 ring-white/80">
                    {activeGroup.time}
                  </span>
                )}
              </h3>
              {activeGroup.id === "permanent" ? (
                <p className="text-xs font-medium text-slate-400 sm:text-sm">
                  Équipement quotidien — toujours dans le cartable
                </p>
              ) : activeGroup.items[0]?.reason ? (
                <p className="truncate text-xs font-medium text-slate-400 sm:text-sm">
                  {activeGroup.items[0].reason}
                </p>
              ) : null}
            </div>
            {activeProgress.done < activeProgress.total && (
              <TouchButton
                ariaLabel={`Tout cocher ${activeGroup.label}`}
                onClick={handleGroupCheckAll}
                className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60 active:bg-emerald-100 sm:text-sm"
              >
                Tout cocher
              </TouchButton>
            )}
          </div>

          <ul className="kiosk-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
            {activeGroup.items.map((item) => (
              <li key={item.id}>
                <BagItemRow
                  item={item}
                  checked={checked.has(item.id)}
                  onToggle={() => onToggle(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="shrink-0 space-y-2 border-t border-slate-100 pt-2">
        {showAddForm ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCustomItem();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ajouter un objet…"
              autoComplete="off"
              spellCheck={false}
              className="shopping-input min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-base font-semibold text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              className="touch-target rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white active:bg-emerald-600"
            >
              OK
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-slate-400 active:text-slate-600"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Ajouter un objet
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        )}
        {inputValue.trim() && showAddForm && (
          <p className="px-1 text-xs text-slate-400">
            {BAG_CATEGORY_META[categorizeBagItem(inputValue)].emoji}{" "}
            {BAG_CATEGORY_META[categorizeBagItem(inputValue)].label}
          </p>
        )}
      </div>

      <TouchButton
        ariaLabel="Sac prêt"
        onClick={onFinish}
        disabled={!allChecked}
        className="touch-target flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-lg font-bold text-white shadow-md shadow-teal-200/30 disabled:opacity-40 active:opacity-90 sm:min-h-[56px] sm:text-xl"
      >
        <CheckCircle className="h-6 w-6" strokeWidth={2.5} />
        Sac prêt !
      </TouchButton>
    </div>
  );
}
