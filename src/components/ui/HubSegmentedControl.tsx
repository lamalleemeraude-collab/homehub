"use client";

import type { LucideIcon } from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import { GLASS } from "@/lib/ui/pastel-theme";

export type HubSegment<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type HubSegmentedControlProps<T extends string> = {
  segments: HubSegment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function HubSegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: HubSegmentedControlProps<T>) {
  return (
    <div className="flex shrink-0 gap-0.5 rounded-full border border-white/70 bg-white/45 p-1 shadow-md shadow-slate-900/5 backdrop-blur-xl">
      {segments.map((segment) => {
        const Icon = segment.icon;
        const active = segment.id === value;
        return (
          <TouchButton
            key={segment.id}
            ariaLabel={segment.label}
            onClick={() => onChange(segment.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 ease-out sm:flex-none sm:px-4 ${
              active ? GLASS.pillActive : GLASS.pillInactive
            }`}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={2.5} />}
            {segment.label}
          </TouchButton>
        );
      })}
    </div>
  );
}
